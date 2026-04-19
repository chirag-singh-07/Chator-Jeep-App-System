import { Types } from "mongoose";
import { ORDER_STATUS, Role, ROLES, OrderStatus } from "../../common/constants";
import { IMenuItem } from "../kitchen/kitchen.model";
import { AppError } from "../../common/errors/app-error";
import { orderEvent } from "../../sockets/events";
import { listMenuByKitchen, findKitchenByOwner } from "../kitchen/kitchen.repository";
import { orderQueue } from "../../jobs/queues";
import * as repo from "./order.repository";

const canTransition = (current: OrderStatus, next: OrderStatus, actorRole: Role): boolean => {
  if (next === ORDER_STATUS.CANCELLED as any) {
    return current !== ORDER_STATUS.DELIVERED as any;
  }

  const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.ACCEPTED],
    [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PREPARING],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY],
    [ORDER_STATUS.READY]: [ORDER_STATUS.OUT_FOR_DELIVERY],
    [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED]
  };

  const allowedNext = transitions[current] ?? [];
  if (!allowedNext.includes(next)) {
    return false;
  }

  if (([ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY] as OrderStatus[]).includes(next)) {
    return actorRole === ROLES.KITCHEN || actorRole === ROLES.ADMIN;
  }

  if (([ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED] as OrderStatus[]).includes(next)) {
    return actorRole === ROLES.DELIVERY || actorRole === ROLES.ADMIN;
  }

  return true;
};

export const createOrder = async (
  userId: string,
  input: { kitchenId: string; items: Array<{ menuItemId: string; quantity: number }> }
) => {
  const menuItems = await listMenuByKitchen(input.kitchenId) as IMenuItem[];
  const menuMap = new Map<string, IMenuItem>(menuItems.map((item) => [item._id.toString(), item]));

  const snapshotItems = input.items.map(({ menuItemId, quantity }) => {
    const item = menuMap.get(menuItemId);
    if (!item || !item.isAvailable) {
      throw new AppError(`Menu item ${menuItemId} not available`, 400);
    }

    return {
      menuItemId: new Types.ObjectId(menuItemId),
      name: item.name,
      price: item.price,
      quantity
    };
  });

  const totalAmount = snapshotItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await repo.createOrder({
    userId: new Types.ObjectId(userId),
    kitchenId: new Types.ObjectId(input.kitchenId),
    items: snapshotItems,
    totalAmount,
    status: ORDER_STATUS.PENDING
  });

  if (orderQueue) {
    try {
      await orderQueue.add(
        "auto-cancel",
        { orderId: order._id.toString() },
        { delay: 5 * 60 * 1000, removeOnComplete: true }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to enqueue order auto-cancel job: ${message}`);
    }
  }

  orderEvent(`user_${userId}`, "order:created", order);
  orderEvent(`kitchen_${input.kitchenId}`, "order:created", order);

  return order;
};

export const listMyOrders = (userId: string) => repo.listOrdersByUser(userId);

export const listKitchenOrders = async (ownerId: string) => {
  const kitchen = await findKitchenByOwner(ownerId);
  if (!kitchen) {
    throw new AppError("Kitchen profile not found", 404);
  }
  return repo.listOrdersByKitchen(kitchen._id.toString());
};

export const updateOrderStatus = async (
  actor: { userId: string; role: Role },
  orderId: string,
  nextStatus: OrderStatus
) => {
  const order = await repo.getOrderById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (!canTransition(order.status, nextStatus, actor.role)) {
    throw new AppError("Invalid status transition", 400);
  }

  const updated = await repo.updateOrder(orderId, { status: nextStatus });
  orderEvent(`user_${order.userId.toString()}`, "order:status_update", updated);
  orderEvent(`kitchen_${order.kitchenId.toString()}`, "order:status_update", updated);

  return updated;
};
