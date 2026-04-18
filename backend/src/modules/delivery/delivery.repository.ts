import { Types } from "mongoose";
import { Delivery, IDelivery } from "./delivery.model";

export const createDelivery = (payload: Partial<IDelivery>): Promise<IDelivery> => Delivery.create(payload);

export const findAssignedByRider = (riderId: string): Promise<IDelivery[]> =>
  Delivery.find({
    riderId: new Types.ObjectId(riderId),
    orderId: { $ne: null },
    isAvailable: false
  })
    .sort({ createdAt: -1 })
    .exec();

export const findDeliveryByOrderId = (orderId: string): Promise<IDelivery | null> =>
  Delivery.findOne({ orderId: new Types.ObjectId(orderId) }).exec();

export const updateDeliveryByOrder = (orderId: string, payload: Partial<IDelivery>): Promise<IDelivery | null> =>
  Delivery.findOneAndUpdate({ orderId: new Types.ObjectId(orderId) }, payload, { new: true }).exec();

export const findNearestAvailableRider = (
  coordinates: [number, number],
  maxDistance = 5000
): Promise<IDelivery | null> =>
  Delivery.findOne({
    isAvailable: true,
    orderId: null,
    currentLocation: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: maxDistance
      }
    }
  }).exec();

export const updateRiderAvailability = (
  riderId: string,
  payload: Partial<IDelivery>
): Promise<IDelivery | null> =>
  Delivery.findOneAndUpdate(
    { riderId: new Types.ObjectId(riderId), orderId: null },
    payload,
    { new: true, upsert: true }
  ).exec();
