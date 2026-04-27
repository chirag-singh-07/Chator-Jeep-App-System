import { Types } from "mongoose";
import { DeliveryPartner, IDeliveryPartner } from "./delivery.model";

export const createDeliveryPartner = (payload: Partial<IDeliveryPartner>): Promise<IDeliveryPartner> => DeliveryPartner.create(payload);

export const findAssignedByRider = (userId: string): Promise<IDeliveryPartner[]> =>
  DeliveryPartner.find({
    userId: new Types.ObjectId(userId),
    currentOrderId: { $ne: null },
    isAvailable: false
  })
    .sort({ createdAt: -1 })
    .exec();

export const findDeliveryByOrderId = (orderId: string): Promise<IDeliveryPartner | null> =>
  DeliveryPartner.findOne({ currentOrderId: new Types.ObjectId(orderId) }).exec();

export const findDeliveryByRiderId = (userId: string): Promise<IDeliveryPartner | null> =>
  DeliveryPartner.findOne({ userId: new Types.ObjectId(userId) }).exec();

export const updateDeliveryByOrder = (orderId: string, payload: Partial<IDeliveryPartner>): Promise<IDeliveryPartner | null> =>
  DeliveryPartner.findOneAndUpdate({ currentOrderId: new Types.ObjectId(orderId) }, payload, { new: true }).exec();

export const findNearestAvailableRider = (
  coordinates: [number, number],
  maxDistance = 5000
): Promise<IDeliveryPartner | null> =>
  DeliveryPartner.findOne({
    isAvailable: true,
    isOnline: true,
    status: "approved",
    currentOrderId: null,
    currentLocation: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: maxDistance
      }
    }
  }).exec();

export const updateRiderAvailability = (
  userId: string,
  payload: Partial<IDeliveryPartner>
): Promise<IDeliveryPartner | null> =>
  DeliveryPartner.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    payload,
    { new: true, upsert: true }
  ).exec();

export const resetRiderAfterDelivery = (
  userId: string,
  payload: Partial<IDeliveryPartner>
): Promise<IDeliveryPartner | null> =>
  DeliveryPartner.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    payload,
    { new: true }
  ).exec();
