import { NotificationService } from "./notification.service";
import { NotificationType } from "./notification.model";

/**
 * Centralized Notification Manager
 * Handles all push notification templates and dispatching for the entire app.
 * English is used for standard lifecycle events.
 * Hinglish is used for promotional events and offers.
 */
export class NotificationManager {
  // ─── CUSTOMER NOTIFICATIONS ──────────────────────────────────────────────────

  static notifyCustomerOrderPlaced(userId: string, orderId: string, itemsTotal: string | number, deliveryAddress: string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Order Placed!",
      body: "Your order has been placed successfully and is waiting for restaurant confirmation.",
      type: "ORDER_PLACED" as NotificationType,
      data: {
        orderId,
        orderAmount: String(itemsTotal),
        orderStatus: "PLACED",
        deliveryAddress,
      },
    });
  }

  static notifyCustomerPaymentConfirmed(userId: string, orderId: string, gatewayLabel: string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Payment Confirmed",
      body: `Your ${gatewayLabel} payment was successful. Your order is now placed.`,
      type: "ORDER_PLACED" as NotificationType,
      data: { orderId },
    });
  }

  static notifyCustomerOrderStatusUpdated(userId: string, orderId: string, status: string, totalAmount: number | string, deliveryAddress: string) {
    const statusLabels: Record<string, string> = {
      ACCEPTED: "Confirmed",
      PREPARING: "Preparing",
      READY: "Ready for Pickup",
      PICKED_UP: "Out for Delivery",
      ARRIVED: "Partner Arrived",
      COMPLETED: "Delivered",
      CANCELLED: "Cancelled",
    };
    const label = statusLabels[status] || status;

    void NotificationService.sendToCustomer(userId, {
      title: `Order ${label}`,
      body: `Your order is now: ${label}.`,
      type: `ORDER_${status}` as NotificationType,
      data: {
        orderId,
        status,
        orderStatus: status,
        orderAmount: String(totalAmount),
        deliveryAddress: deliveryAddress || "",
      },
    });
  }

  static notifyCustomerOrderRejected(userId: string, orderId: string, reason: string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Order Rejected",
      body: `Unfortunately, the restaurant rejected your order. Reason: ${reason}`,
      type: "ORDER_CANCELLED" as NotificationType,
      data: { orderId, reason },
    });
  }

  static notifyCustomerOrderCancelled(userId: string, orderId: string, reason?: string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Order Cancelled",
      body: reason ? `Order cancelled. Reason: ${reason}` : "Your order has been cancelled.",
      type: "ORDER_CANCELLED" as NotificationType,
      data: { orderId },
    });
  }

  static notifyCustomerDeliveryAssigned(userId: string, orderId: string, partnerName: string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Delivery Partner Assigned",
      body: `${partnerName} has been assigned to deliver your order.`,
      type: "DELIVERY_ASSIGNED" as NotificationType,
      data: { orderId },
    });
  }

  static notifyCustomerOrderPickedUp(userId: string, orderId: string, partnerName: string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Order Picked Up!",
      body: `${partnerName} has picked up your order and is on the way.`,
      type: "ORDER_OUT_FOR_DELIVERY" as NotificationType,
      data: { orderId },
    });
  }

  static notifyCustomerOrderDelivered(userId: string, orderId: string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Order Delivered!",
      body: "Your order has been delivered successfully. Enjoy your meal!",
      type: "ORDER_DELIVERED" as NotificationType,
      data: { orderId },
    });
  }

  static notifyCustomerRefundProcessed(userId: string, orderId: string, refundAmount: number | string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Refund Processed",
      body: `A refund of Rs ${refundAmount} has been processed for order #${orderId.slice(-6).toUpperCase()}.`,
      type: "REFUND_PROCESSED" as NotificationType,
      data: { orderId, refundAmount },
    });
  }

  // ─── RESTAURANT NOTIFICATIONS ────────────────────────────────────────────────

  static notifyRestaurantNewOrder(restaurantId: string, orderId: string, itemsTotal: string | number, deliveryAddress: string) {
    void NotificationService.sendToRestaurant(restaurantId, {
      title: `New Order #${orderId.slice(-6).toUpperCase()}`,
      body: `You received a new order worth ₹${itemsTotal}. Please confirm.`,
      type: "NEW_ORDER" as NotificationType,
      data: {
        orderId,
        orderAmount: String(itemsTotal),
        deliveryAddress,
        orderStatus: "PLACED",
      },
    });
  }

  static notifyRestaurantNewBulkOrder(restaurantId: string, orderId: string, itemsTotal: string | number, deliveryAddress: string) {
    void NotificationService.sendToRestaurant(restaurantId, {
      title: `🎉 New Bulk/Party Order #${orderId.slice(-6).toUpperCase()}`,
      body: `You received a massive new order worth ₹${itemsTotal}! Please prepare.`,
      type: "NEW_ORDER" as NotificationType,
      data: {
        orderId,
        orderAmount: String(itemsTotal),
        deliveryAddress,
        orderStatus: "PLACED",
      },
    });
  }

  static notifyRestaurantOrderCancelled(restaurantId: string, orderId: string) {
    void NotificationService.sendToRestaurant(restaurantId, {
      title: "Order Cancelled",
      body: `Order #${orderId.slice(-6).toUpperCase()} has been cancelled.`,
      type: "ORDER_CANCELLED" as NotificationType,
      data: { orderId },
    });
  }

  static notifyRestaurantDeliveryAssigned(restaurantId: string, orderId: string, partnerName: string) {
    void NotificationService.sendToRestaurant(restaurantId, {
      title: "Delivery Partner Assigned",
      body: `${partnerName} will pick up order #${orderId.slice(-6).toUpperCase()}.`,
      type: "DELIVERY_ASSIGNED" as NotificationType,
      data: { orderId },
    });
  }

  static notifyRestaurantOrderDelivered(restaurantId: string, orderId: string) {
    void NotificationService.sendToRestaurant(restaurantId, {
      title: "Order Delivered",
      body: `Order #${orderId.slice(-6).toUpperCase()} has been delivered successfully.`,
      type: "ORDER_DELIVERED" as NotificationType,
      data: { orderId },
    });
  }


  // ─── DELIVERY PARTNER NOTIFICATIONS ──────────────────────────────────────────

  static notifyPartnerDeliveryRequest(
    partnerId: string, 
    orderId: string, 
    restaurantName: string, 
    earnings: number, 
    requestPayload: any,
    customerName: string,
    orderAmount: string | number,
    deliveryAddress: string,
    orderStatus: string
  ) {
    void NotificationService.sendToPartner(partnerId, {
      title: `New Delivery Request #${orderId.slice(-6).toUpperCase()}`,
      body: `New order near ${restaurantName}. Earnings: ₹${earnings}`,
      type: "NEW_DELIVERY_REQUEST" as NotificationType,
      data: {
        ...requestPayload,
        customerName,
        orderAmount: String(orderAmount),
        deliveryAddress,
        orderStatus,
      },
    });
  }

  static notifyPartnerBulkDeliveryRequest(
    partnerId: string, 
    orderId: string, 
    restaurantName: string, 
    earnings: number, 
    requestPayload: any,
    customerName: string,
    orderAmount: string | number,
    deliveryAddress: string,
    orderStatus: string
  ) {
    void NotificationService.sendToPartner(partnerId, {
      title: `📦 Bulk Delivery Request #${orderId.slice(-6).toUpperCase()}`,
      body: `Large party order near ${restaurantName}. High Earnings: ₹${earnings}!`,
      type: "NEW_DELIVERY_REQUEST" as NotificationType,
      data: {
        ...requestPayload,
        customerName,
        orderAmount: String(orderAmount),
        deliveryAddress,
        orderStatus,
      },
    });
  }

  static notifyPartnerDeliveryCancelled(partnerId: string, orderId: string) {
    void NotificationService.sendToPartner(partnerId, {
      title: "Delivery Cancelled",
      body: `Delivery for order #${orderId.slice(-6).toUpperCase()} has been cancelled.`,
      type: "DELIVERY_CANCELLED" as NotificationType,
      data: { orderId },
    });
  }

  static notifyPartnerOrderReady(partnerId: string, orderId: string, restaurantName: string) {
    void NotificationService.sendToPartner(partnerId, {
      title: "Order Ready for Pickup!",
      body: `The order at ${restaurantName} is ready to be picked up.`,
      type: "ORDER_READY" as NotificationType,
      data: { orderId },
    });
  }


  // ─── PROMOTIONAL NOTIFICATIONS (HINGLISH) ──────────────────────────────────

  static async broadcastOffer(
    audience: "ALL" | "CUSTOMERS" | "PARTNERS" | "RESTAURANTS", 
    title?: string, 
    body?: string, 
    image?: string,
    data?: any
  ) {
    // Fallback Hinglish text for promotional broadcasts
    const finalTitle = title || "Khaas Offer Sirf Aapke Liye! 💥";
    const finalBody = body || "Bhari discount aur offers ka faida uthayein. Aaj hi order karein!";
    
    await NotificationService.broadcast(audience, { 
      title: finalTitle, 
      body: finalBody, 
      image,
      data: {
        ...data,
        isPromotional: "true"
      }
    });
  }
}
