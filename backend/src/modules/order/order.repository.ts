import { Types } from "mongoose";
import { IOrder, Order } from "./order.model";

export const createOrder = (payload: Partial<IOrder>): Promise<IOrder> =>
  Order.create(payload);

export const getOrderById = (orderId: string): Promise<IOrder | null> =>
  Order.findById(orderId)
    .populate("restaurantId", "name phone address logoUrls")
    .lean()
    .exec() as any;

export const listOrdersByUser = (userId: string): Promise<IOrder[]> =>
  Order.find({ userId: new Types.ObjectId(userId) })
    .populate("restaurantId", "name logoUrls")
    .sort({ createdAt: -1 })
    .lean()
    .exec() as any;

export const listOrdersByRestaurant = (restaurantId: string): Promise<IOrder[]> =>
  Order.find({ restaurantId: new Types.ObjectId(restaurantId) })
    .populate("userId", "name phone")
    .sort({ createdAt: -1 })
    .lean()
    .exec() as any;

export const updateOrder = (orderId: string, payload: Partial<IOrder>): Promise<IOrder | null> =>
  Order.findByIdAndUpdate(orderId, payload, { new: true })
    .populate("restaurantId", "name logoUrls")
    .lean()
    .exec() as any;
