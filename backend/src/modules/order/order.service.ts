import { Types } from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS, Role, ROLES, OrderStatus } from "../../common/constants";
import { IMenuItem } from "../restaurant/restaurant.model";
import { AppError } from "../../common/errors/app-error";
import { listMenuByRestaurant, findRestaurantByOwner } from "../restaurant/restaurant.repository";
import { orderQueue } from "../../jobs/queues";
import * as repo from "./order.repository";
import { notifyRidersForOrder } from "../delivery/delivery.service";
import { NotificationManager } from "../notification/notification.manager";
import { deductUserWallet, refundUserWallet } from "../wallet/user-wallet.service";
import { buildPhonePeRedirectProxyUrl, createPhonePePayment, getPhonePeOrderStatus } from "../payment/phonepe.service";
import { createRazorpayOrder, fetchRazorpayOrder, verifyRazorpayPayment } from "../payment/razorpay.service";
import { Order } from "./order.model";
import { UserWalletTransaction } from "../wallet/user-wallet.model";
import { addEarningsToRestaurant } from "../restaurant/restaurant.service";
import { getPlatformConfig } from "../system/system.service";
import { haversineKm } from "../../common/utils/geo.util";
import { Restaurant } from "../restaurant/restaurant.model";
import { validateCoupon, incrementCouponUsage } from "../coupon/coupon.service";
import { withTransaction } from "../../common/utils/transaction.util";

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
    couponCode?: string;
  }
) => {
  return withTransaction(async (session) => {
    const draft = await buildOrderDraft(userId, input);
    const paymentMethod = input.paymentMethod || "COD";

  let walletAmountUsed = 0;
  if (paymentMethod === "WALLET" || paymentMethod === "PARTIAL_WALLET") {
    const requestedDeduction = paymentMethod === "WALLET" ? draft.itemsTotal : input.useWalletAmount || 0;
    walletAmountUsed = await deductUserWallet(userId, requestedDeduction, "pending", session);
  }

  const remainingAmount = Math.max(0, draft.itemsTotal - walletAmountUsed);

  const initialPaymentStatus =
    paymentMethod === "COD"
      ? PAYMENT_STATUS.UNPAID
      : paymentMethod === "WALLET" && walletAmountUsed >= draft.itemsTotal
        ? PAYMENT_STATUS.PAID
        : PAYMENT_STATUS.UNPAID;

  const order = await repo.createOrder({
    ...draft.payload,
    paymentMethod,
    walletAmountUsed,
    couponCode: draft.couponCode || null,
    couponDiscount: draft.couponDiscount || 0,
    paymentStatus: initialPaymentStatus,
  } as any, session);

  if (draft.couponCode) {
    await incrementCouponUsage(draft.couponCode);
  }

  if (walletAmountUsed > 0) {
    await UserWalletTransaction.updateOne(
      { userId, referenceId: "pending", referenceType: "ORDER" },
      { referenceId: order._id.toString() },
      { session }
    );
  }

  await notifyNewOrder(order._id.toString(), userId, input.restaurantId, draft.itemsTotal, input.deliveryAddress, draft.payload.isBulkOrder);

  return { ...order.toObject(), remainingAmount };
  });
};

type OrderInput = {
  restaurantId: string;
  items: Array<{ menuItemId: string; quantity: number }>;
  deliveryAddress: string;
  location: { type: "Point"; coordinates: [number, number] };
  paymentMethod?: "COD" | "ONLINE" | "WALLET" | "PARTIAL_WALLET";
  useWalletAmount?: number;
  couponCode?: string;
  isBulkOrder?: boolean;
  scheduledDeliveryTime?: string | Date;
};

const buildOrderDraft = async (userId: string, input: OrderInput) => {
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
  
  const rawDistanceKm = haversineKm(
    restaurant.location.coordinates as [number, number],
    input.location.coordinates
  );
  const distanceKm = Math.min(rawDistanceKm, 15);

  let deliveryFee = Math.round(config.deliveryBaseFee + distanceKm * config.deliveryPerKmFee);
  
  if (input.isBulkOrder) {
    if (foodTotal < 5000) {
      throw new AppError("Bulk orders must have a minimum value of ₹5000", 400);
    }
    if (!input.scheduledDeliveryTime) {
      throw new AppError("Scheduled delivery time is required for bulk orders", 400);
    }
    const scheduledTime = new Date(input.scheduledDeliveryTime);
    const minTime = new Date(Date.now() + 3 * 60 * 60 * 1000);
    if (scheduledTime < minTime) {
      throw new AppError("Bulk orders must be scheduled at least 3 hours in advance", 400);
    }
    
    // Add extra delivery price based on items (e.g. ₹20 per item over 10 items)
    const totalItems = snapshotItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 10) {
      deliveryFee += (totalItems - 10) * 20;
    }
  }
  const offerActive = Boolean(
    restaurant.launchOfferExpiresAt &&
      restaurant.launchOfferExpiresAt.getTime() > Date.now(),
  );
  const commissionPercentage = offerActive
    ? restaurant.registrationPayment?.launchCommissionPercentage ??
      restaurant.currentCommissionPercentage ??
      config.commissionPercentage
    : restaurant.registrationPayment?.normalCommissionPercentage ??
      restaurant.currentCommissionPercentage ??
      config.commissionPercentage;
  const commissionAmount = Math.round((foodTotal * commissionPercentage) / 100);
  const platformFee = config.platformFixedFee;

  const itemsTotal = foodTotal + deliveryFee + platformFee;

  // Apply coupon if provided
  let couponDiscount = 0;
  let couponCode: string | null = null;
  if (input.couponCode) {
    try {
      const couponResult = await validateCoupon(input.couponCode, itemsTotal);
      couponDiscount = couponResult.discount;
      couponCode = couponResult.code;
    } catch {
      // Coupon invalid — proceed without discount (don't block the order)
    }
  }

  const finalTotal = Math.max(0, itemsTotal - couponDiscount);

  return {
    itemsTotal: finalTotal,
    couponCode,
    couponDiscount,
    payload: {
      userId: new Types.ObjectId(userId),
      restaurantId: new Types.ObjectId(input.restaurantId),
      items: snapshotItems,
      foodAmount: foodTotal,
      deliveryFee,
      commissionAmount,
      platformFee,
      totalAmount: finalTotal,
      deliveryAddress: input.deliveryAddress,
      location: input.location,
      status: ORDER_STATUS.PENDING,
      isBulkOrder: input.isBulkOrder || false,
      scheduledDeliveryTime: input.scheduledDeliveryTime ? new Date(input.scheduledDeliveryTime) : null,
    },
  };
};

const notifyNewOrder = async (
  orderId: string,
  userId: string,
  restaurantId: string,
  itemsTotal: number,
  deliveryAddress?: string,
  isBulkOrder?: boolean
) => {
  if (orderQueue) {
    try {
      await orderQueue.add(
        "auto-cancel",
        { orderId },
        { delay: 5 * 60 * 1000, removeOnComplete: true }
      );
    } catch (error) {
      console.warn("Failed to enqueue auto-cancel job:", error instanceof Error ? error.message : error);
    }
  }

  NotificationManager.notifyCustomerOrderPlaced(userId, orderId, itemsTotal, deliveryAddress || "");
  if (isBulkOrder) {
    NotificationManager.notifyRestaurantNewBulkOrder(restaurantId, orderId, itemsTotal, deliveryAddress || "");
  } else {
    NotificationManager.notifyRestaurantNewOrder(restaurantId, orderId, itemsTotal, deliveryAddress || "");
  }
};

const notifyCustomerPaymentConfirmed = (userId: string, orderId: string, gatewayLabel: string) => {
  NotificationManager.notifyCustomerPaymentConfirmed(userId, orderId, gatewayLabel);
};

export const handleRazorpayWebhookForOrder = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  event: string,
  failureReason?: string
) => {
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) return false; // Not a food order

  if (order.paymentStatus === PAYMENT_STATUS.PAID && (event === "payment.captured" || event === "payment.authorized")) {
    return true; // Idempotent: already paid
  }

  if (event === "payment.failed") {
    // We could mark it failed, but currently paymentStatus is UNPAID, PAID, REFUNDED.
    return true;
  }

  if (event === "payment.captured" || event === "payment.authorized") {
    return withTransaction(async (session) => {
      await repo.updateOrder(order._id.toString(), {
        paymentStatus: PAYMENT_STATUS.PAID,
        paymentGateway: "RAZORPAY",
        razorpayPaymentId,
      } as any, session);
    }).then(() => {
      notifyCustomerPaymentConfirmed(order.userId.toString(), order._id.toString(), "Razorpay");
      return true;
    });
  }

  return true;
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

export const initiateRazorpayCheckout = async (userId: string, input: OrderInput) => {
  const draft = await buildOrderDraft(userId, { ...input, paymentMethod: "ONLINE" });
  const rzpOrder = await createRazorpayOrder(
    draft.itemsTotal,
    "INR",
    `cart_${Date.now()}`,
    { userId, restaurantId: input.restaurantId },
  );

  return {
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    amountRupees: draft.itemsTotal,
    currency: rzpOrder.currency || "INR",
    key: process.env.RAZORPAY_KEY_ID,
    breakdown: {
      foodAmount: draft.payload.foodAmount,
      deliveryFee: draft.payload.deliveryFee,
      platformFee: draft.payload.platformFee,
      couponDiscount: draft.couponDiscount || 0,
      couponCode: draft.couponCode || null,
      totalAmount: draft.itemsTotal,
    },
  };
};

export const verifyPaymentAndCreateOrder = async (
  userId: string,
  input: OrderInput & {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
) => {
  const isValid = verifyRazorpayPayment(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature,
  );

  if (!isValid) throw new AppError("Payment verification failed - invalid signature", 400);

  const draft = await buildOrderDraft(userId, { ...input, paymentMethod: "ONLINE" });
  const razorpayOrder = await fetchRazorpayOrder(input.razorpayOrderId);
  const paidAmountPaise = Number(razorpayOrder.amount);
  const expectedAmountPaise = Math.round(draft.itemsTotal * 100);

  if (paidAmountPaise !== expectedAmountPaise) {
    throw new AppError("Payment amount does not match the order total", 400);
  }

  const order = await repo.createOrder({
    ...draft.payload,
    paymentMethod: "ONLINE",
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentGateway: "RAZORPAY",
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    walletAmountUsed: 0,
    couponCode: draft.couponCode || null,
    couponDiscount: draft.couponDiscount || 0,
  } as any);

  if (draft.couponCode) {
    await incrementCouponUsage(draft.couponCode);
  }

  await notifyNewOrder(order._id.toString(), userId, input.restaurantId, draft.itemsTotal, input.deliveryAddress, draft.payload.isBulkOrder);
  notifyCustomerPaymentConfirmed(userId, order._id.toString(), "Razorpay");

  return { ...order.toObject(), remainingAmount: 0 };
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

export const listMyOrders = (userId: string, page: number = 1, limit: number = 20) => repo.listOrdersByUser(userId, page, limit);

export const getOrderDetail = async (userId: string, orderId: string) => {
  const order = await Order.findById(orderId)
    .populate("restaurantId", "name phone address logoUrls")
    .populate("deliveryId", "fullName phoneNumber email profilePhoto vehicleType vehicleFuelType bikeNumber status currentLocation lastLocationUpdatedAt")
    .select("+deliveryOtp")
    .exec();

  if (!order) throw new AppError("Order not found", 404);
  if ((order as any).userId.toString() !== userId) throw new AppError("Forbidden", 403);

  return order.toObject();
};

export const listRestaurantOrders = async (userId: string, page: number = 1, limit: number = 20) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  return repo.listOrdersByRestaurant(restaurant._id.toString(), page, limit);
};

export const adminListOrders = async (query: { status?: string; page?: string; limit?: string }) => {
  const status = query.status;
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "20");
  
  const { orders, total } = await repo.adminListOrders(status, page, limit);
  
  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
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

  return withTransaction(async (session) => {
    await repo.updateOrder(orderId, {
      status: ORDER_STATUS.CANCELLED,
      cancellationReason: reason || "Cancelled by customer",
    } as any, session);

    if (order.walletAmountUsed && order.walletAmountUsed > 0) {
      await refundUserWallet(userId, order.walletAmountUsed, orderId, "Order cancelled - wallet refund", session);
    }
  }).then(() => {
    NotificationManager.notifyRestaurantOrderCancelled(order.restaurantId.toString(), orderId);
    NotificationManager.notifyCustomerOrderCancelled(userId, orderId, reason);

    return { success: true, refunded: order.walletAmountUsed || 0 };
  });
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

  NotificationManager.notifyCustomerOrderStatusUpdated(
    order.userId.toString(),
    orderId,
    nextStatus,
    order.totalAmount,
    order.deliveryAddress
  );

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

export const checkoutPreview = async (userId: string, input: OrderInput) => {
  const draft = await buildOrderDraft(userId, input);
  return {
    foodAmount: draft.payload.foodAmount,
    deliveryFee: draft.payload.deliveryFee,
    platformFee: draft.payload.platformFee,
    couponDiscount: draft.couponDiscount || 0,
    couponCode: draft.couponCode || null,
    totalAmount: draft.itemsTotal,
  };
};

export const adminRefund = async (
  adminId: string,
  orderId: string,
  input: { amount: number; reason: string }
) => {
  const order = await repo.getOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);

  if (order.paymentStatus === PAYMENT_STATUS.REFUNDED) {
    throw new AppError("Payment already refunded", 400);
  }

  if (order.paymentMethod === "COD") {
    throw new AppError("COD orders cannot be refunded through online refund", 400);
  }

  const refundAmount = input.amount || order.totalAmount;

  return withTransaction(async (session) => {
    await repo.updateOrder(orderId, {
      paymentStatus: PAYMENT_STATUS.REFUNDED,
    } as any, session);

    if (order.walletAmountUsed && order.walletAmountUsed > 0) {
      await refundUserWallet(order.userId.toString(), order.walletAmountUsed, orderId, `Admin refund: ${input.reason}`, session);
    }
  }).then(() => {
    NotificationManager.notifyCustomerRefundProcessed(order.userId.toString(), orderId, refundAmount);

    return {
      success: true,
      refundAmount,
      reason: input.reason,
      orderId,
      refundedAt: new Date(),
    };
  });
};
