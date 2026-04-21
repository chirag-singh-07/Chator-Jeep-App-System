import { AppError } from "../../common/errors/app-error";
import { ORDER_STATUS } from "../../common/constants";
import { deliveryEvent, orderEvent } from "../../sockets/events";
import { findRestaurantById } from "../restaurant/restaurant.repository";
import { getOrderById, updateOrder } from "../order/order.repository";
import { IUser, User } from "../user/user.model";
import { creditDeliveryPartnerEarnings, getDeliveryWalletOverview } from "../wallet/wallet.service";
import * as repo from "./delivery.repository";

const roundAmount = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const haversineKm = (from: [number, number], to: [number, number]) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;

  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const startLat = toRadians(lat1);
  const endLat = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatRestaurantAddress = (restaurant: Awaited<ReturnType<typeof findRestaurantById>>) => {
  if (!restaurant?.address) {
    return "Pickup address not available";
  }

  return [
    restaurant.address.line1,
    restaurant.address.city,
    restaurant.address.state,
    restaurant.address.pinCode,
  ]
    .filter(Boolean)
    .join(", ");
};

const formatUserAddress = (user: IUser | null) => {
  const address = user?.addresses?.[0];
  if (!address) {
    return "Delivery address not available";
  }

  return [address.line1, address.city].filter(Boolean).join(", ");
};

const getDeliveryCoordinates = (user: IUser | null) =>
  user?.addresses?.[0]?.location?.coordinates as [number, number] | undefined;

const getDeliveryFeeConfig = () => {
  const base = Number(process.env.DELIVERY_EARNING_BASE ?? 35);
  const perKm = Number(process.env.DELIVERY_EARNING_PER_KM ?? 6);
  return {
    base: Number.isFinite(base) ? base : 35,
    perKm: Number.isFinite(perKm) ? perKm : 6,
  };
};

const calculateDeliveryEarnings = (
  pickupCoordinates?: [number, number],
  dropCoordinates?: [number, number]
) => {
  const { base, perKm } = getDeliveryFeeConfig();
  const distanceKm =
    pickupCoordinates && dropCoordinates ? haversineKm(pickupCoordinates, dropCoordinates) : 0;
  const estimatedAmount = roundAmount(base + distanceKm * perKm);

  return {
    distanceKm: roundAmount(distanceKm),
    estimatedAmount,
    finalAmount: estimatedAmount,
  };
};

const buildStatusTimeline = (delivery: any) => [
  {
    label: "Assigned",
    done: true,
    date: delivery.updatedAt,
  },
  {
    label: "Accepted",
    done: Boolean(delivery.acceptedAt),
    date: delivery.acceptedAt,
  },
  {
    label: "Picked up",
    done: Boolean(delivery.pickedUpAt),
    date: delivery.pickedUpAt,
  },
  {
    label: "Delivered",
    done: Boolean(delivery.deliveredAt),
    date: delivery.deliveredAt,
  },
];

const emitDeliveryUpdate = (rooms: string[], event: string, payload: unknown) => {
  rooms.forEach((room) => deliveryEvent(room, event, payload));
};

const getRelatedRooms = (delivery: any, order: any) => {
  const rooms = [
    `rider_${delivery.riderId.toString()}`,
    "admin",
  ];

  if (order?.userId) {
    rooms.push(`user_${order.userId.toString()}`);
  }

  if (order?.restaurantId) {
    rooms.push(`restaurant_${order.restaurantId.toString()}`);
  }

  return rooms;
};

const buildDeliveryPayload = async (delivery: any) => {
  const [order, rider, restaurant] = await Promise.all([
    delivery.orderId ? getOrderById(delivery.orderId.toString()) : Promise.resolve(null),
    User.findById(delivery.riderId).exec(),
    delivery.orderId
      ? getOrderById(delivery.orderId.toString()).then((orderDoc) =>
          orderDoc ? findRestaurantById(orderDoc.restaurantId.toString()) : null
        )
      : Promise.resolve(null),
  ]);

  const customer = order ? await User.findById(order.userId).exec() : null;
  const deliveryAddress = formatUserAddress(customer);
  const deliveryCoordinates =
    delivery.route?.dropCoordinates || getDeliveryCoordinates(customer) || undefined;
  const pickupCoordinates =
    delivery.route?.pickupCoordinates ||
    (restaurant?.location?.coordinates as [number, number] | undefined);

  return {
    id: delivery._id.toString(),
    orderId: order?._id?.toString() ?? null,
    rider: rider
      ? {
          id: rider._id.toString(),
          name: rider.name,
          phone: rider.phone,
          email: rider.email,
        }
      : null,
    status: delivery.status,
    isAvailable: delivery.isAvailable,
    isOnline: delivery.isOnline,
    acceptedAt: delivery.acceptedAt,
    pickedUpAt: delivery.pickedUpAt,
    deliveredAt: delivery.deliveredAt,
    currentLocation: delivery.currentLocation,
    lastLocationUpdatedAt: delivery.lastLocationUpdatedAt,
    route: {
      pickupAddress: delivery.route?.pickupAddress || formatRestaurantAddress(restaurant),
      dropAddress: delivery.route?.dropAddress || deliveryAddress,
      pickupCoordinates,
      dropCoordinates: deliveryCoordinates,
    },
    restaurant: restaurant
      ? {
          id: restaurant._id.toString(),
          name: restaurant.name,
          phone: restaurant.phone,
          address: formatRestaurantAddress(restaurant),
          coordinates: restaurant.location?.coordinates,
        }
      : null,
    customer: customer
      ? {
          id: customer._id.toString(),
          name: customer.name,
          phone: customer.phone,
          address: deliveryAddress,
          coordinates: deliveryCoordinates,
        }
      : null,
    order: order
      ? {
          id: order._id.toString(),
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          status: order.status,
          items: order.items,
          createdAt: order.createdAt,
        }
      : null,
    paymentSummary: order
      ? {
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
        }
      : null,
    earnings: delivery.earnings,
    statusTimeline: buildStatusTimeline(delivery),
  };
};

export const assignNearestRiderToOrder = async (orderId: string) => {
  const order = await getOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);

  const [restaurant, customer] = await Promise.all([
    findRestaurantById(order.restaurantId.toString()),
    User.findById(order.userId).exec(),
  ]);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  const rider = await repo.findNearestAvailableRider(restaurant.location.coordinates);
  if (!rider || !rider.riderId) throw new AppError("No available rider found", 404);

  const pickupCoordinates = restaurant.location.coordinates as [number, number];
  const dropCoordinates = getDeliveryCoordinates(customer);
  const earnings = calculateDeliveryEarnings(pickupCoordinates, dropCoordinates);

  const delivery = await repo.updateRiderAvailability(rider.riderId.toString(), {
    orderId: order._id,
    status: "ASSIGNED",
    isAvailable: false,
    acceptedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    route: {
      pickupAddress: formatRestaurantAddress(restaurant),
      dropAddress: formatUserAddress(customer),
      pickupCoordinates,
      dropCoordinates,
    },
    earnings,
  });

  if (!delivery) throw new AppError("Unable to assign rider", 500);

  await updateOrder(orderId, { deliveryId: delivery._id, status: ORDER_STATUS.OUT_FOR_DELIVERY });
  const payload = await buildDeliveryPayload(delivery);

  emitDeliveryUpdate(getRelatedRooms(delivery, order), "delivery:assigned", payload);
  orderEvent(`user_${order.userId.toString()}`, "delivery:assigned", payload);

  return payload;
};

export const listAssignedOrders = async (riderId: string) => {
  const deliveries = await repo.findAssignedByRider(riderId);
  return Promise.all(deliveries.map((delivery) => buildDeliveryPayload(delivery)));
};

export const getAssignedOrderDetail = async (riderId: string, orderId: string) => {
  const delivery = await repo.findDeliveryByOrderId(orderId);
  if (!delivery || delivery.riderId.toString() !== riderId) {
    throw new AppError("Delivery not found", 404);
  }

  return buildDeliveryPayload(delivery);
};

export const acceptAssignedOrder = async (riderId: string, orderId: string) => {
  const delivery = await repo.findDeliveryByOrderId(orderId);
  if (!delivery || delivery.riderId.toString() !== riderId) {
    throw new AppError("Delivery not found", 404);
  }

  if (delivery.acceptedAt) {
    return buildDeliveryPayload(delivery);
  }

  const updated = await repo.updateDeliveryByOrder(orderId, {
    acceptedAt: new Date(),
  });

  if (!updated) {
    throw new AppError("Unable to accept assignment", 400);
  }

  const order = await getOrderById(orderId);
  const payload = await buildDeliveryPayload(updated);
  emitDeliveryUpdate(getRelatedRooms(updated, order), "delivery:accepted", payload);

  return payload;
};

export const getRiderDashboard = async (riderId: string) => {
  const [deliveryState, assignedOrders, walletOverview] = await Promise.all([
    repo.findDeliveryByRiderId(riderId),
    listAssignedOrders(riderId),
    getDeliveryWalletOverview(riderId),
  ]);

  return {
    availability: {
      isOnline: Boolean(deliveryState?.isOnline),
      isAvailable: deliveryState ? deliveryState.isAvailable : true,
      currentLocation: deliveryState?.currentLocation ?? null,
      lastLocationUpdatedAt: deliveryState?.lastLocationUpdatedAt ?? null,
    },
    activeOrder: assignedOrders[0] ?? null,
    assignedOrders,
    wallet: {
      balance: walletOverview.balance,
      heldBalance: walletOverview.heldBalance,
      totalEarnings: walletOverview.totalEarnings,
      totalPaidOut: walletOverview.totalPaidOut,
      pendingPayouts: walletOverview.pendingPayouts,
    },
  };
};

export const updateAvailability = async (
  riderId: string,
  input: { isOnline: boolean; coordinates?: [number, number] }
) => {
  const current = await repo.findDeliveryByRiderId(riderId);

  if (!input.isOnline && current?.orderId) {
    throw new AppError("Cannot go offline during an active delivery", 400);
  }

  const payload: Record<string, unknown> = {
    isOnline: input.isOnline,
    isAvailable: input.isOnline && !current?.orderId,
  };

  if (input.coordinates) {
    payload.currentLocation = { type: "Point", coordinates: input.coordinates };
    payload.lastLocationUpdatedAt = new Date();
  } else if (!current) {
    payload.currentLocation = { type: "Point", coordinates: [77.1025, 28.7041] };
  }

  const updated = await repo.updateRiderAvailability(riderId, payload as any);
  if (!updated) {
    throw new AppError("Unable to update availability", 400);
  }

  const order = updated.orderId ? await getOrderById(updated.orderId.toString()) : null;
  const response = {
    isOnline: updated.isOnline,
    isAvailable: updated.isAvailable,
    currentLocation: updated.currentLocation,
    lastLocationUpdatedAt: updated.lastLocationUpdatedAt,
  };

  emitDeliveryUpdate(getRelatedRooms(updated, order), "delivery:availability_update", response);

  return response;
};

export const updateDeliveryStatus = async (riderId: string, orderId: string, status: "PICKED_UP" | "DELIVERED") => {
  const delivery = await repo.findDeliveryByOrderId(orderId);
  if (!delivery || delivery.riderId.toString() !== riderId) throw new AppError("Delivery not found", 404);

  const order = await getOrderById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (status === "PICKED_UP") {
    const updated = await repo.updateDeliveryByOrder(orderId, {
      status,
      pickedUpAt: new Date(),
      acceptedAt: delivery.acceptedAt ?? new Date(),
    });

    if (!updated) {
      throw new AppError("Unable to update delivery status", 400);
    }

    const payload = await buildDeliveryPayload(updated);
    emitDeliveryUpdate(getRelatedRooms(updated, order), "delivery:status_update", payload);
    orderEvent(`user_${order.userId.toString()}`, "order:status_update", payload);
    return payload;
  }

  const completed = await repo.updateDeliveryByOrder(orderId, {
    status,
    deliveredAt: new Date(),
    pickedUpAt: delivery.pickedUpAt ?? new Date(),
    acceptedAt: delivery.acceptedAt ?? new Date(),
    isAvailable: true,
  });

  if (!completed) {
    throw new AppError("Unable to update delivery status", 400);
  }

  await updateOrder(orderId, { status: ORDER_STATUS.DELIVERED });
  await creditDeliveryPartnerEarnings({
    riderId,
    amount: completed.earnings?.finalAmount ?? 0,
    orderId,
    description: "Delivery earnings credited",
    metadata: {
      distanceKm: completed.earnings?.distanceKm ?? 0,
      orderTotal: order.totalAmount,
    },
  });

  const payload = await buildDeliveryPayload(completed);
  emitDeliveryUpdate(getRelatedRooms(completed, order), "delivery:status_update", payload);
  orderEvent(`user_${order.userId.toString()}`, "order:status_update", payload);

  await repo.resetRiderAfterDelivery(riderId, {
    orderId: null,
    status: "AVAILABLE",
    isAvailable: true,
    acceptedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    route: null,
    earnings: null,
  });

  return payload;
};

export const updateMyLocation = async (riderId: string, coordinates: [number, number]) => {
  const delivery = await repo.updateRiderAvailability(riderId, {
    currentLocation: { type: "Point", coordinates },
    lastLocationUpdatedAt: new Date(),
  });

  if (!delivery) throw new AppError("Unable to update location", 400);

  const order = delivery.orderId ? await getOrderById(delivery.orderId.toString()) : null;
  const payload = {
    riderId,
    orderId: delivery.orderId?.toString() ?? null,
    currentLocation: delivery.currentLocation,
    lastLocationUpdatedAt: delivery.lastLocationUpdatedAt,
    status: delivery.status,
  };

  emitDeliveryUpdate(getRelatedRooms(delivery, order), "delivery:location_update", payload);
  return payload;
};
