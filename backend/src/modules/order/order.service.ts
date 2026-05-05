import { Types } from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS, Role, ROLES, OrderStatus } from "../../common/constants";
import { IMenuItem } from "../restaurant/restaurant.model";
import { AppError } from "../../common/errors/app-error";
import { listMenuByRestaurant, findRestaurantByOwner } from "../restaurant/restaurant.repository";
import { orderQueue } from "../../jobs/queues";
import * as repo from "./order.repository";
import { notifyRidersForOrder } from "../delivery/delivery.service";
import { NotificationService } from "../notification/notification.service";
import { deductUserWallet, refundUserWallet } from "../wallet/user-wallet.service";
import { buildPhonePeRedirectProxyUrl, createPhonePePayment, getPhonePeOrderStatus } from "../payment/phonepe.service";
import { createRazorpayOrder, verifyRazorpayPayment } from "../payment/razorpay.service";
import { Order } from "./order.model";
import { UserWalletTransaction } from "../wallet/user-wallet.model";
import { addEarningsToRestaurant } from "../restaurant/restaurant.service";
import { getPlatformConfig } from "../system/system.service";
import { haversineKm } from "../../common/utils/geo.util";
import { Restaurant } from "../restaurant/restaurant.model";

const canTransition = (current: OrderStatus, next: OrderStatus, actorRole: Role): boolean => {
  if ((next as string) === ORDER_STATUS.CANCELLED) {
    return current !== ORDER_STATUS.COMPLETED;
  }

  const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.ACCEPTED],
    [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PREPARING],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY],
    [ORDER_STATUS.READY]: [ORDER_STATUS.PICKED_UP],
    [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.ARRIVED],
    [ORDER_STATUS.ARRIVED]: [ORDER_STATUS.COMPLETED],
  };

  const allowedNext = transitions[current] ?? [];
  if (!allowedNext.includes(next)) return false;

  if (([ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY] as OrderStatus[]).includes(next)) {
    return actorRole === ROLES.KITCHEN || actorRole === ROLES.ADMIN;
  }

  if (([ORDER_STATUS.PICKED_UP, ORDER_STATUS.ARRIVED, ORDER_STATUS.COMPLETED] as OrderStatus[]).includes(next)) {
    return actorRole === ROLES.DELIVERY || actorRole === ROLES.ADMIN;
  }

  return true;
};

export const createOrder = async (
  userId: string,
  input: {
    restaurantId: string;
    items: Array<{ menuItemId: string; quantity: number }>;
    deliveryAddress: string;
    location: { type: "Point"; coordinates: [number, number] };
    paymentMethod?: "COD" | "ONLINE" | "WALLET" | "PARTIAL_WALLET";
    useWalletAmount?: number;
  }
) => {
  const menuItems = (await listMenuByRestaurant(input.restaurantId)) as IMenuItem[];
  const menuMap = new Map<string, IMenuItem>(menuItems.map((item) => [item._id.toString(), item]));

  const snapshotItems = input.items.map(({ menuItemId, quantity }) => {
    const item = menuMap.get(menuItemId);
    if (!item || !item.isAvailable) throw new AppError(`Menu item ${menuItemId} not available`, 400);
    return { menuItemId: new Types.ObjectId(menuItemId), name: item.name, price: item.price, quantity };
  });

  const foodTotal = snapshotItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate Delivery Fee & Commission
  const restaurant = await Restaurant.findById(input.restaurantId).exec();
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  const config = await getPlatformConfig();
  
  const distanceKm = haversineKm(
    restaurant.location.coordinates as [number, number],
    input.location.coordinates
  );

  const deliveryFee = Math.round(config.deliveryBaseFee + distanceKm * config.deliveryPerKmFee);
  const commissionAmount = Math.round((foodTotal * config.commissionPercentage) / 100);
  const platformFee = config.platformFixedFee;

  const itemsTotal = foodTotal + deliveryFee + platformFee;
  const paymentMethod = input.paymentMethod || "COD";

  let walletAmountUsed = 0;
  if (paymentMethod === "WALLET" || paymentMethod === "PARTIAL_WALLET") {
    const requestedDeduction = paymentMethod === "WALLET" ? itemsTotal : input.useWalletAmount || 0;
    walletAmountUsed = await deductUserWallet(userId, requestedDeduction, "pending");
  }

  const remainingAmount = Math.max(0, itemsTotal - walletAmountUsed);

  const initialPaymentStatus =
    paymentMethod === "COD"
      ? PAYMENT_STATUS.UNPAID
      : paymentMethod === "WALLET" && walletAmountUsed >= itemsTotal
        ? PAYMENT_STATUS.PAID
        : PAYMENT_STATUS.UNPAID;

  const order = await repo.createOrder({
    userId: new Types.ObjectId(userId),
    restaurantId: new Types.ObjectId(input.restaurantId),
    items: snapshotItems,
    foodAmount: foodTotal,
    deliveryFee,
    commissionAmount,
    platformFee,
    totalAmount: itemsTotal,
    deliveryAddress: input.deliveryAddress,
    location: input.location,
    status: ORDER_STATUS.PENDING,
    paymentMethod,
    walletAmountUsed,
    paymentStatus: initialPaymentStatus,
  } as any);

  if (walletAmountUsed > 0) {
    await UserWalletTransaction.updateOne(
      { userId, referenceId: "pending", referenceType: "ORDER" },
      { referenceId: order._id.toString() }
    );
  }

  if (orderQueue) {
    try {
      await orderQueue.add(
        "auto-cancel",
        { orderId: order._id.toString() },
        { delay: 5 * 60 * 1000, removeOnComplete: true }
      );
    } catch (error) {
      console.warn("Failed to enqueue auto-cancel job:", error instanceof Error ? error.message : error);
    }
  }

  void NotificationService.sendToCustomer(userId, {
    title: "Order Placed!",
    body: "Your order has been placed. Waiting for restaurant confirmation.",
    type: "ORDER_PLACED",
    data: { orderId: order._id.toString() },
  });

  void NotificationService.sendToRestaurant(input.restaurantId, {
    title: "New Order Received!",
    body: `New order worth Rs.${itemsTotal}. Please confirm.`,
    type: "ORDER_PLACED",
    data: { orderId: order._id.toString() },
  });

  return { ...order.toObject(), remainingAmount };
};

const notifyCustomerPaymentConfirmed = (userId: string, orderId: string, gatewayLabel: string) => {
  void NotificationService.sendToCustomer(userId, {
    title: "Payment Confirmed",
    body: `Your ${gatewayLabel} payment was successful. Order is now placed.`,
    type: "ORDER_PLACED",
    data: { orderId },
  });
};

const markOrderPaidIfNeeded = async (
  orderId: string,
  userId: string,
  gatewayLabel: string,
  payload: Record<string, unknown>
) => {
  const updated = await repo.updateOrder(orderId, {
    paymentStatus: PAYMENT_STATUS.PAID,
    ...payload,
  } as any);

  notifyCustomerPaymentConfirmed(userId, orderId, gatewayLabel);
  return updated;
};

const buildMerchantOrderId = (orderId: string) => `FOOD-${orderId.slice(-8).toUpperCase()}-${Date.now()}`;

export const initiatePhonePePayment = async (
  userId: string,
  orderId: string,
  input?: { redirectUrl?: string }
) => {
  const order = await repo.getOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.userId.toString() !== userId) throw new AppError("Forbidden", 403);
  if (order.paymentStatus === PAYMENT_STATUS.PAID) throw new AppError("Already paid", 400);

  const amountToPay = order.totalAmount - (order.walletAmountUsed || 0);
  if (amountToPay <= 0) throw new AppError("No payment required", 400);
  if (!input?.redirectUrl) {
    throw new AppError("A redirect URL is required to start PhonePe checkout", 400);
  }

  const merchantOrderId = buildMerchantOrderId(orderId);
  const paymentSession = await createPhonePePayment({
    merchantOrderId,
    amount: amountToPay,
    redirectUrl: buildPhonePeRedirectProxyUrl(input.redirectUrl, merchantOrderId),
    metaInfo: {
      udf1: orderId,
      udf2: userId,
    },
  });

  await repo.updateOrder(orderId, {
    paymentGateway: "PHONEPE",
    phonepeMerchantOrderId: merchantOrderId,
  } as any);

  return {
    provider: "PHONEPE",
    merchantOrderId,
    checkoutUrl: paymentSession.checkoutUrl,
    amount: amountToPay,
    currency: "INR",
  };
};

export const getPhonePePaymentStatus = async (userId: string, orderId: string) => {
  const order = await repo.getOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.userId.toString() !== userId) throw new AppError("Forbidden", 403);

  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    return {
      paymentStatus: order.paymentStatus,
      provider: order.paymentGateway || "PHONEPE",
      providerState: "PAID",
      order,
    };
  }

  if (!order.phonepeMerchantOrderId) {
    throw new AppError("PhonePe payment has not been initiated for this order", 400);
  }

  const providerStatus = await getPhonePeOrderStatus(order.phonepeMerchantOrderId);
  const updatedOrder = providerStatus.isPaid
    ? await markOrderPaidIfNeeded(orderId, userId, "PhonePe", {
        paymentGateway: "PHONEPE",
        phonepeTransactionId: providerStatus.transactionId,
      })
    : order;

  if (!updatedOrder) {
    throw new AppError("Failed to update the order after PhonePe status confirmation", 500);
  }

  return {
    paymentStatus: providerStatus.isPaid ? PAYMENT_STATUS.PAID : updatedOrder.paymentStatus,
    provider: "PHONEPE",
    providerState: providerStatus.providerState,
    isPending: providerStatus.isPending,
    merchantOrderId: order.phonepeMerchantOrderId,
    transactionId: providerStatus.transactionId,
    order: updatedOrder,
  };
};

export const initiateRazorpayPayment = async (userId: string, orderId: string) => {
  const order = await repo.getOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.userId.toString() !== userId) throw new AppError("Forbidden", 403);
  if (order.paymentStatus === PAYMENT_STATUS.PAID) throw new AppError("Already paid", 400);

  const amountToPay = order.totalAmount - (order.walletAmountUsed || 0);
  if (amountToPay <= 0) throw new AppError("No payment required", 400);

  const rzpOrder = await createRazorpayOrder(amountToPay, "INR", `order_${orderId.slice(-8)}`, { orderId, userId });

  await repo.updateOrder(orderId, {
    paymentGateway: "RAZORPAY",
    razorpayOrderId: rzpOrder.id,
  } as any);

  return {
    razorpayOrderId: rzpOrder.id,
    amount: amountToPay,
    currency: "INR",
    key: process.env.RAZORPAY_KEY_ID,
  };
};

export const verifyAndConfirmPayment = async (
  userId: string,
  input: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
) => {
  const order = await repo.getOrderById(input.orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.userId.toString() !== userId) throw new AppError("Forbidden", 403);

  const isValid = verifyRazorpayPayment(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature
  );

  if (!isValid) throw new AppError("Payment verification failed - invalid signature", 400);

  const updated = await markOrderPaidIfNeeded(input.orderId, userId, "Razorpay", {
    paymentGateway: "RAZORPAY",
    razorpayPaymentId: input.razorpayPaymentId,
  });

  return updated;
};

export const listMyOrders = (userId: string) => repo.listOrdersByUser(userId);

export const getOrderDetail = async (userId: string, orderId: string) => {
  const order = await Order.findById(orderId)
    .populate("restaurantId", "name phone address logoUrls")
    .populate("deliveryId", "rider status")
    .select("+deliveryOtp")
    .exec();

  if (!order) throw new AppError("Order not found", 404);
  if ((order as any).userId.toString() !== userId) throw new AppError("Forbidden", 403);

  return order.toObject();
};

export const listRestaurantOrders = async (ownerId: string) => {
  const restaurant = await findRestaurantByOwner(ownerId);
  if (!restaurant) throw new AppError("Restaurant profile not found", 404);
  return repo.listOrdersByRestaurant(restaurant._id.toString());
};

export const cancelOrder = async (userId: string, orderId: string, reason?: string) => {
  const order = await repo.getOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.userId.toString() !== userId) throw new AppError("Forbidden", 403);

  const uncancellableStatuses: OrderStatus[] = [
    ORDER_STATUS.PICKED_UP,
    ORDER_STATUS.ARRIVED,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
  ];

  if (uncancellableStatuses.includes(order.status)) {
    throw new AppError(`Cannot cancel order in ${order.status} state`, 400);
  }

  await repo.updateOrder(orderId, {
    status: ORDER_STATUS.CANCELLED,
    cancellationReason: reason || "Cancelled by customer",
  } as any);

  if (order.walletAmountUsed && order.walletAmountUsed > 0) {
    await refundUserWallet(userId, order.walletAmountUsed, orderId, "Order cancelled - wallet refund");
  }

  void NotificationService.sendToRestaurant(order.restaurantId.toString(), {
    title: "Order Cancelled",
    body: "A customer cancelled their order.",
    type: "ORDER_CANCELLED" as any,
    data: { orderId },
  });

  void NotificationService.sendToCustomer(userId, {
    title: "Order Cancelled",
    body: reason ? `Order cancelled. Reason: ${reason}` : "Your order has been cancelled.",
    type: "ORDER_CANCELLED" as any,
    data: { orderId },
  });

  return { success: true, refunded: order.walletAmountUsed || 0 };
};

export const updateOrderStatus = async (
  actor: { userId: string; role: Role },
  orderId: string,
  nextStatus: OrderStatus
) => {
  const order = await repo.getOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);

  if (!canTransition(order.status, nextStatus, actor.role)) {
    throw new AppError(`Cannot transition from ${order.status} to ${nextStatus}`, 400);
  }

  const updated = await repo.updateOrder(orderId, { status: nextStatus });

  const statusLabels: Record<string, string> = {
    [ORDER_STATUS.ACCEPTED]: "Confirmed",
    [ORDER_STATUS.PREPARING]: "Preparing",
    [ORDER_STATUS.READY]: "Ready for Pickup",
    [ORDER_STATUS.PICKED_UP]: "Out for Delivery",
    [ORDER_STATUS.ARRIVED]: "Partner Arrived",
    [ORDER_STATUS.COMPLETED]: "Delivered",
    [ORDER_STATUS.CANCELLED]: "Cancelled",
  };

  const label = statusLabels[nextStatus as string] || nextStatus;

  void NotificationService.sendToCustomer(order.userId.toString(), {
    title: `Order ${label}`,
    body: `Your order is now: ${label}.`,
    type: `ORDER_${nextStatus}` as any,
    data: { orderId, status: nextStatus },
  });

  if (nextStatus === ORDER_STATUS.READY) {
    void notifyRidersForOrder(orderId);
  }

  if (nextStatus === ORDER_STATUS.COMPLETED && order.status !== ORDER_STATUS.COMPLETED) {
    try {
      const restaurantEarning = (order.foodAmount || order.totalAmount) - (order.commissionAmount || 0);
      await addEarningsToRestaurant(order.restaurantId.toString(), restaurantEarning);
    } catch (error) {
      console.error("Failed to credit restaurant wallet:", error);
    }
  }

  return updated;
};
