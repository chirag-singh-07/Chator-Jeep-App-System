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
import { createRazorpayOrder, verifyRazorpayPayment } from "../payment/razorpay.service";
import { Order } from "./order.model";
import { UserWalletTransaction } from "../wallet/user-wallet.model";
import { addEarningsToRestaurant } from "../restaurant/restaurant.service";

// ─── Status transition guard ─────────────────────────────────────────────────

const canTransition = (current: OrderStatus, next: OrderStatus, actorRole: Role): boolean => {
  if ((next as string) === ORDER_STATUS.CANCELLED) {
    return current !== ORDER_STATUS.COMPLETED;
  }

  const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    [ORDER_STATUS.PENDING]:   [ORDER_STATUS.ACCEPTED],
    [ORDER_STATUS.ACCEPTED]:  [ORDER_STATUS.PREPARING],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY],
    [ORDER_STATUS.READY]:     [ORDER_STATUS.PICKED_UP],
    [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.ARRIVED],
    [ORDER_STATUS.ARRIVED]:   [ORDER_STATUS.COMPLETED],
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

// ─── Create Order ─────────────────────────────────────────────────────────────

export const createOrder = async (
  userId: string,
  input: {
    restaurantId: string;
    items: Array<{ menuItemId: string; quantity: number }>;
    deliveryAddress: string;
    location: { type: "Point"; coordinates: [number, number] };
    paymentMethod?: "COD" | "ONLINE" | "WALLET" | "PARTIAL_WALLET";
    useWalletAmount?: number; // For PARTIAL_WALLET: how much to deduct from wallet
  }
) => {
  const menuItems = await listMenuByRestaurant(input.restaurantId) as IMenuItem[];
  const menuMap = new Map<string, IMenuItem>(menuItems.map((item) => [item._id.toString(), item]));

  const snapshotItems = input.items.map(({ menuItemId, quantity }) => {
    const item = menuMap.get(menuItemId);
    if (!item || !item.isAvailable) throw new AppError(`Menu item ${menuItemId} not available`, 400);
    return { menuItemId: new Types.ObjectId(menuItemId), name: item.name, price: item.price, quantity };
  });

  const itemsTotal = snapshotItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paymentMethod = input.paymentMethod || "COD";

  // ── Wallet deduction (before creating order) ──────────────────────────────
  let walletAmountUsed = 0;
  if (paymentMethod === "WALLET" || paymentMethod === "PARTIAL_WALLET") {
    const requestedDeduction = paymentMethod === "WALLET" ? itemsTotal : (input.useWalletAmount || 0);
    walletAmountUsed = await deductUserWallet(userId, requestedDeduction, "pending");
  }

  const remainingAmount = Math.max(0, itemsTotal - walletAmountUsed);

  // For COD or if wallet covered everything
  const initialPaymentStatus =
    paymentMethod === "COD" ? PAYMENT_STATUS.UNPAID :
    paymentMethod === "WALLET" && walletAmountUsed >= itemsTotal ? PAYMENT_STATUS.PAID :
    PAYMENT_STATUS.UNPAID;

  const order = await repo.createOrder({
    userId: new Types.ObjectId(userId),
    restaurantId: new Types.ObjectId(input.restaurantId),
    items: snapshotItems,
    totalAmount: itemsTotal,
    deliveryAddress: input.deliveryAddress,
    location: input.location,
    status: ORDER_STATUS.PENDING,
    paymentMethod,
    walletAmountUsed,
    paymentStatus: initialPaymentStatus,
  } as any);

  // Fix up pending wallet deduction referenceId now that we have orderId
  if (walletAmountUsed > 0) {
    await UserWalletTransaction.updateOne(
      { userId, referenceId: "pending", referenceType: "ORDER" },
      { referenceId: order._id.toString() }
    );
  }

  // ── Auto-cancel job ───────────────────────────────────────────────────────
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

  // ── Notifications ─────────────────────────────────────────────────────────
  void NotificationService.sendToCustomer(userId, {
    title: "Order Placed! 🎉",
    body: "Your order has been placed. Waiting for restaurant confirmation.",
    type: "ORDER_PLACED",
    data: { orderId: order._id.toString() },
  });

  void NotificationService.sendToRestaurant(input.restaurantId, {
    title: "New Order Received! 🍽",
    body: `New order worth ₹${itemsTotal}. Please confirm.`,
    type: "ORDER_PLACED",
    data: { orderId: order._id.toString() },
  });

  return { ...order.toObject(), remainingAmount };
};

// ─── Razorpay: Initiate Payment ───────────────────────────────────────────────

export const initiateRazorpayPayment = async (userId: string, orderId: string) => {
  const order = await repo.getOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.userId.toString() !== userId) throw new AppError("Forbidden", 403);
  if (order.paymentStatus === PAYMENT_STATUS.PAID) throw new AppError("Already paid", 400);

  const amountToPay = order.totalAmount - (order.walletAmountUsed || 0);
  if (amountToPay <= 0) throw new AppError("No payment required", 400);

  const rzpOrder = await createRazorpayOrder(
    amountToPay,
    "INR",
    `order_${orderId.slice(-8)}`,
    { orderId, userId }
  );

  await repo.updateOrder(orderId, { razorpayOrderId: rzpOrder.id } as any);

  return {
    razorpayOrderId: rzpOrder.id,
    amount: amountToPay,
    currency: "INR",
    key: process.env.RAZORPAY_KEY_ID,
  };
};

// ─── Razorpay: Verify Payment ─────────────────────────────────────────────────

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

  if (!isValid) throw new AppError("Payment verification failed — invalid signature", 400);

  const updated = await repo.updateOrder(input.orderId, {
    paymentStatus: PAYMENT_STATUS.PAID,
    razorpayPaymentId: input.razorpayPaymentId,
  } as any);

  void NotificationService.sendToCustomer(userId, {
    title: "Payment Confirmed ✅",
    body: "Your payment was successful. Order is now placed.",
    type: "ORDER_PLACED",
    data: { orderId: input.orderId },
  });

  return updated;
};

// ─── List Orders ──────────────────────────────────────────────────────────────

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

// ─── Cancel Order ─────────────────────────────────────────────────────────────

export const cancelOrder = async (
  userId: string,
  orderId: string,
  reason?: string
) => {
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

  // ── Refund wallet amount used ─────────────────────────────────────────────
  if (order.walletAmountUsed && order.walletAmountUsed > 0) {
    await refundUserWallet(userId, order.walletAmountUsed, orderId, "Order cancelled — wallet refund");
  }

  // ── Notify restaurant ─────────────────────────────────────────────────────
  void NotificationService.sendToRestaurant(order.restaurantId.toString(), {
    title: "Order Cancelled",
    body: "A customer cancelled their order.",
    type: "ORDER_CANCELLED" as any,
    data: { orderId },
  });

  void NotificationService.sendToCustomer(userId, {
    title: "Order Cancelled",
    body: reason
      ? `Order cancelled. Reason: ${reason}`
      : "Your order has been cancelled.",
    type: "ORDER_CANCELLED" as any,
    data: { orderId },
  });

  return { success: true, refunded: order.walletAmountUsed || 0 };
};

// ─── Update Status ────────────────────────────────────────────────────────────

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

  // ── Notification labels ───────────────────────────────────────────────────
  const statusLabels: Record<string, string> = {
    [ORDER_STATUS.ACCEPTED]:  "Confirmed ✅",
    [ORDER_STATUS.PREPARING]: "Preparing 👨‍🍳",
    [ORDER_STATUS.READY]:     "Ready for Pickup 📦",
    [ORDER_STATUS.PICKED_UP]: "Out for Delivery 🛵",
    [ORDER_STATUS.ARRIVED]:   "Partner Arrived 📍",
    [ORDER_STATUS.COMPLETED]: "Delivered 🎉",
    [ORDER_STATUS.CANCELLED]: "Cancelled",
  };

  const label = statusLabels[nextStatus as string] || nextStatus;

  void NotificationService.sendToCustomer(order.userId.toString(), {
    title: `Order ${label}`,
    body: `Your order is now: ${label.replace(/[^\w\s]/g, "").trim()}.`,
    type: `ORDER_${nextStatus}` as any,
    data: { orderId, status: nextStatus },
  });

  // ── When READY → find riders ──────────────────────────────────────────────
  if (nextStatus === ORDER_STATUS.READY) {
    void notifyRidersForOrder(orderId);
  }

  // ── When COMPLETED → credit restaurant wallet ─────────────────────────────
  if (nextStatus === ORDER_STATUS.COMPLETED && order.status !== ORDER_STATUS.COMPLETED) {
    try {
      await addEarningsToRestaurant(order.restaurantId.toString(), order.totalAmount);
    } catch (e) {
      console.error("Failed to credit restaurant wallet:", e);
    }
  }

  return updated;
};
