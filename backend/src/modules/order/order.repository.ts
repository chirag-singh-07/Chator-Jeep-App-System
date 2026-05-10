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

export const adminListOrders = async (
  status?: string,
  page = 1,
  limit = 20
): Promise<{ orders: IOrder[]; total: number }> => {
  const filter: any = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("restaurantId", "name")
      .populate("userId", "name phone email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
    Order.countDocuments(filter).exec(),
  ]);

  return { orders: orders as any[], total };
};

export const updateOrder = (orderId: string, payload: Partial<IOrder>): Promise<IOrder | null> =>
  Order.findByIdAndUpdate(orderId, payload, { new: true })
    .populate("restaurantId", "name logoUrls")
    .lean()
    .exec() as any;
