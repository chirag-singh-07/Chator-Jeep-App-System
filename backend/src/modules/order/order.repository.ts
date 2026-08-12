import { Types, ClientSession } from "mongoose";
import { IOrder, Order } from "./order.model";

export const createOrder = (payload: Partial<IOrder>, session?: ClientSession): Promise<IOrder> =>
  Order.create([payload], { session }).then((docs) => docs[0]);

export const getOrderById = (orderId: string): Promise<IOrder | null> =>
  Order.findById(orderId)
    .populate("restaurantId", "name phone address logoUrls")
    .populate("deliveryId", "fullName phoneNumber email profilePhoto vehicleType vehicleFuelType bikeNumber status")
    .lean()
    .exec() as any;

export const listOrdersByUser = async (userId: string, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ userId: new Types.ObjectId(userId) })
      .populate("restaurantId", "name logoUrls")
      .populate("deliveryId", "fullName phoneNumber profilePhoto vehicleType status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Order.countDocuments({ userId: new Types.ObjectId(userId) }).exec(),
  ]);
  return { orders, total };
};

export const listOrdersByRestaurant = async (restaurantId: string, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ restaurantId: new Types.ObjectId(restaurantId) })
      .populate("userId", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Order.countDocuments({ restaurantId: new Types.ObjectId(restaurantId) }).exec(),
  ]);
  return { orders, total };
};

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

export const updateOrder = (
  orderId: string,
  payload: Partial<IOrder>,
  session?: ClientSession
): Promise<IOrder | null> =>
  Order.findByIdAndUpdate(orderId, payload, { new: true, session })
    .populate("restaurantId", "name logoUrls")
    .populate("deliveryId", "fullName phoneNumber profilePhoto vehicleType status")
    .lean()
    .exec() as any;
