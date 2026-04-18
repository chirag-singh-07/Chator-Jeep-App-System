import { Types } from "mongoose";
import { IOrder, Order } from "./order.model";

export const createOrder = (payload: Partial<IOrder>): Promise<IOrder> => Order.create(payload);
export const getOrderById = (orderId: string): Promise<IOrder | null> => Order.findById(orderId).exec();
export const listOrdersByUser = (userId: string): Promise<IOrder[]> =>
  Order.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
export const listOrdersByKitchen = (kitchenId: string): Promise<IOrder[]> =>
  Order.find({ kitchenId: new Types.ObjectId(kitchenId) }).sort({ createdAt: -1 }).exec();
export const updateOrder = (orderId: string, payload: Partial<IOrder>): Promise<IOrder | null> =>
  Order.findByIdAndUpdate(orderId, payload, { new: true }).exec();
