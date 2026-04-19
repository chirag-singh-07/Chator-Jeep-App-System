import { AppError } from "../../common/errors/app-error";
import { ORDER_STATUS } from "../../common/constants";
import { deliveryEvent, orderEvent } from "../../sockets/events";
import { findRestaurantById } from "../restaurant/restaurant.repository";
import { getOrderById, updateOrder } from "../order/order.repository";
import * as repo from "./delivery.repository";

export const assignNearestRiderToOrder = async (orderId: string) => {
  const order = await getOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);

  const restaurant = await findRestaurantById(order.restaurantId.toString());
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  const rider = await repo.findNearestAvailableRider(restaurant.location.coordinates);
  if (!rider || !rider.riderId) throw new AppError("No available rider found", 404);

  const delivery = await repo.updateRiderAvailability(rider.riderId.toString(), {
    orderId: order._id,
    status: "ASSIGNED",
    isAvailable: false
  });

  if (!delivery) throw new AppError("Unable to assign rider", 500);

  await updateOrder(orderId, { deliveryId: delivery._id, status: ORDER_STATUS.OUT_FOR_DELIVERY });

  orderEvent(`user_${order.userId.toString()}`, "delivery:assigned", delivery);
  deliveryEvent(`rider_${delivery.riderId.toString()}`, "delivery:assigned", delivery);

  return delivery;
};

export const listAssignedOrders = async (riderId: string) => repo.findAssignedByRider(riderId);

export const updateDeliveryStatus = async (riderId: string, orderId: string, status: "PICKED_UP" | "DELIVERED") => {
  const delivery = await repo.findDeliveryByOrderId(orderId);
  if (!delivery || delivery.riderId.toString() !== riderId) throw new AppError("Delivery not found", 404);

  const updated = await repo.updateDeliveryByOrder(orderId, {
    status: status === "DELIVERED" ? "AVAILABLE" : status,
    isAvailable: status === "DELIVERED",
    orderId: status === "DELIVERED" ? null : delivery.orderId
  });

  if (status === "DELIVERED") {
    await updateOrder(orderId, { status: ORDER_STATUS.DELIVERED });
  }

  deliveryEvent(`rider_${riderId}`, "delivery:status_update", updated);
  return updated;
};

export const updateMyLocation = async (riderId: string, coordinates: [number, number]) => {
  const delivery = await repo.updateRiderAvailability(riderId, {
    currentLocation: { type: "Point", coordinates }
  });

  if (!delivery) throw new AppError("Unable to update location", 400);

  deliveryEvent(`rider_${riderId}`, "delivery:location_update", delivery);
  return delivery;
};
