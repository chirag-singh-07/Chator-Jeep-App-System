import { notificationQueue } from "../../jobs/queues";
import { NotificationService } from "./notification.service";
import { NotificationType } from "./notification.model";
import {
  ORDER_PLACED_TEMPLATES,
  ORDER_ACCEPTED_TEMPLATES,
  ORDER_PREPARING_TEMPLATES,
  ORDER_READY_TEMPLATES,
  ORDER_OUT_FOR_DELIVERY_TEMPLATES,
  ORDER_DELIVERED_TEMPLATES,
  ORDER_CANCELLED_TEMPLATES,
  getOrderTemplate,
} from "./notification.templates";
import { notifConfig } from "./notification.config";
import type { NotificationJobData } from "../../jobs/workers/notification.worker";

/**
 * Centralized Notification Manager
 *
 * All customer push notifications are enqueued to BullMQ for async processing.
 * This keeps the API response fast and delegates retries/dedup to the worker.
 *
 * Fallback: If Redis/BullMQ is not available, falls back to direct
 * NotificationService.sendToCustomer() call to ensure notifications always fire.
 *
 * Restaurant & Partner notifications fire directly (they are not part of
 * the user-facing dedup system, and the number is low enough).
 */
export class NotificationManager {
  // ─── Queue Helper ──────────────────────────────────────────────────────────────

  private static async enqueueOrSendDirect(jobData: NotificationJobData): Promise<void> {
    if (!notifConfig.enabled) {
      console.log(`[NotificationManager] ⏸️  Notifications disabled — skipping ${jobData.type} for user ${jobData.userId}`);
      return;
    }

    if (notificationQueue) {
      try {
        await notificationQueue.add("send-push", jobData, {
          attempts: notifConfig.retryAttempts,
          backoff: { type: "exponential", delay: notifConfig.retryBaseDelayMs },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 200 },
          jobId: jobData.deduplicationKey, // BullMQ dedup at queue level too
        });
        console.log(`[NotificationManager] 📤 Enqueued ${jobData.type} for user ${jobData.userId} | key: ${jobData.deduplicationKey}`);
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[NotificationManager] ⚠️  BullMQ enqueue failed, falling back to direct send: ${msg}`);
      }
    }

    // Fallback: send directly if queue unavailable
    console.log(`[NotificationManager] 🔁 Fallback direct send for ${jobData.type} → user ${jobData.userId}`);
    void NotificationService.sendToCustomer(jobData.userId, {
      title: jobData.title,
      body: jobData.body,
      type: jobData.type as NotificationType,
      data: jobData.data,
    });
  }

  // ─── CUSTOMER NOTIFICATIONS ──────────────────────────────────────────────────

  static notifyCustomerOrderPlaced(userId: string, orderId: string, itemsTotal: string | number, deliveryAddress: string, restaurantName = "") {
    const { title, body, language } = getOrderTemplate(ORDER_PLACED_TEMPLATES, {
      restaurantName: restaurantName || "the restaurant",
      amount: String(itemsTotal),
    });
    void this.enqueueOrSendDirect({
      userId,
      orderId,
      type: "ORDER_PLACED",
      title,
      body,
      language,
      deduplicationKey: `order:${orderId}:status:PLACED`,
      data: {
        orderId,
        orderAmount: String(itemsTotal),
        orderStatus: "PLACED",
        deliveryAddress,
        screen: "order-details",
      },
    });
  }

  static notifyCustomerPaymentConfirmed(userId: string, orderId: string, gatewayLabel: string) {
    void this.enqueueOrSendDirect({
      userId,
      orderId,
      type: "PAYMENT_CONFIRMED",
      title: "Payment Confirmed ✅",
      body: `Your ${gatewayLabel} payment was successful. Your order is now placed.`,
      language: "en",
      deduplicationKey: `order:${orderId}:payment:confirmed`,
      data: { orderId, gateway: gatewayLabel, screen: "order-details" },
    });
  }

  static notifyCustomerOrderStatusUpdated(
    userId: string,
    orderId: string,
    status: string,
    totalAmount: number | string,
    deliveryAddress: string
  ) {
    const templateMap: Record<string, typeof ORDER_PLACED_TEMPLATES> = {
      ACCEPTED: ORDER_ACCEPTED_TEMPLATES,
      PREPARING: ORDER_PREPARING_TEMPLATES,
      READY: ORDER_READY_TEMPLATES,
      PICKED_UP: ORDER_OUT_FOR_DELIVERY_TEMPLATES,
      ARRIVED: ORDER_OUT_FOR_DELIVERY_TEMPLATES,
      COMPLETED: ORDER_DELIVERED_TEMPLATES,
      CANCELLED: ORDER_CANCELLED_TEMPLATES,
    };

    const templates = templateMap[status];
    if (!templates) {
      // Unknown status — simple fallback
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
        data: { orderId, status, orderAmount: String(totalAmount), deliveryAddress, screen: "order-details" },
      });
      return;
    }

    const { title, body, language } = getOrderTemplate(templates, {
      orderNumber: orderId.slice(-6).toUpperCase(),
    });
    void this.enqueueOrSendDirect({
      userId,
      orderId,
      type: `ORDER_${status}`,
      title,
      body,
      language,
      deduplicationKey: `order:${orderId}:status:${status}`,
      data: {
        orderId,
        status,
        orderStatus: status,
        orderAmount: String(totalAmount),
        deliveryAddress: deliveryAddress || "",
        screen: "order-details",
      },
    });
  }

  static notifyCustomerOrderRejected(userId: string, orderId: string, reason: string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Order Rejected",
      body: `Unfortunately, the restaurant rejected your order. Reason: ${reason}`,
      type: "ORDER_CANCELLED" as NotificationType,
      data: { orderId, reason, screen: "order-details" },
    });
  }

  static notifyCustomerOrderCancelled(userId: string, orderId: string, reason?: string) {
    const { title, body, language } = getOrderTemplate(ORDER_CANCELLED_TEMPLATES, {
      orderNumber: orderId.slice(-6).toUpperCase(),
    });
    void this.enqueueOrSendDirect({
      userId,
      orderId,
      type: "ORDER_CANCELLED",
      title,
      body,
      language,
      deduplicationKey: `order:${orderId}:status:CANCELLED`,
      data: { orderId, reason: reason || "", screen: "order-details" },
    });
  }

  static notifyCustomerDeliveryAssigned(userId: string, orderId: string, partnerName: string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Delivery Partner Assigned 🛵",
      body: `${partnerName} has been assigned to deliver your order.`,
      type: "DELIVERY_ASSIGNED" as NotificationType,
      data: { orderId, screen: "order-details" },
    });
  }

  static notifyCustomerOrderPickedUp(userId: string, orderId: string, partnerName: string) {
    const { title, body, language } = getOrderTemplate(ORDER_OUT_FOR_DELIVERY_TEMPLATES);
    void this.enqueueOrSendDirect({
      userId,
      orderId,
      type: "ORDER_OUT_FOR_DELIVERY",
      title,
      body,
      language,
      deduplicationKey: `order:${orderId}:status:PICKED_UP`,
      data: { orderId, partnerName, screen: "order-details" },
    });
  }

  static notifyCustomerOrderDelivered(userId: string, orderId: string) {
    const { title, body, language } = getOrderTemplate(ORDER_DELIVERED_TEMPLATES);
    void this.enqueueOrSendDirect({
      userId,
      orderId,
      type: "ORDER_DELIVERED",
      title,
      body,
      language,
      deduplicationKey: `order:${orderId}:status:DELIVERED`,
      data: { orderId, screen: "order-details" },
    });
  }

  static notifyCustomerRefundProcessed(userId: string, orderId: string, refundAmount: number | string) {
    void NotificationService.sendToCustomer(userId, {
      title: "Refund Processed 💸",
      body: `A refund of ₹${refundAmount} has been processed for order #${orderId.slice(-6).toUpperCase()}.`,
      type: "REFUND_PROCESSED" as NotificationType,
      data: { orderId, refundAmount, screen: "order-details" },
    });
  }

  // ─── RESTAURANT NOTIFICATIONS ─────────────────────────────────────────────────
  // Restaurant & Partner notifications fire directly (volume is low, no dedup needed)

  static notifyRestaurantNewOrder(restaurantId: string, orderId: string, itemsTotal: string | number, deliveryAddress: string) {
    void NotificationService.sendToRestaurant(restaurantId, {
      title: `New Order #${orderId.slice(-6).toUpperCase()} 🔔`,
      body: `You received a new order worth ₹${itemsTotal}. Please confirm.`,
      type: "NEW_ORDER" as NotificationType,
      data: { orderId, orderAmount: String(itemsTotal), deliveryAddress, orderStatus: "PLACED" },
    });
  }

  static notifyRestaurantNewBulkOrder(restaurantId: string, orderId: string, itemsTotal: string | number, deliveryAddress: string) {
    void NotificationService.sendToRestaurant(restaurantId, {
      title: `🎉 New Bulk/Party Order #${orderId.slice(-6).toUpperCase()}`,
      body: `You received a massive new order worth ₹${itemsTotal}! Please prepare.`,
      type: "NEW_ORDER" as NotificationType,
      data: { orderId, orderAmount: String(itemsTotal), deliveryAddress, orderStatus: "PLACED" },
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
      data: { ...requestPayload, customerName, orderAmount: String(orderAmount), deliveryAddress, orderStatus },
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
      data: { ...requestPayload, customerName, orderAmount: String(orderAmount), deliveryAddress, orderStatus },
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
      title: "Order Ready for Pickup! 📦",
      body: `The order at ${restaurantName} is ready to be picked up.`,
      type: "ORDER_READY" as NotificationType,
      data: { orderId },
    });
  }

  // ─── PROMOTIONAL BROADCAST ────────────────────────────────────────────────────

  static async broadcastOffer(
    audience: "ALL" | "CUSTOMERS" | "PARTNERS" | "RESTAURANTS",
    title?: string,
    body?: string,
    image?: string,
    data?: any
  ) {
    const finalTitle = title || "Khaas Offer Sirf Aapke Liye! 💥";
    const finalBody = body || "Bhari discount aur offers ka faida uthayein. Aaj hi order karein!";
    await NotificationService.broadcast(audience, {
      title: finalTitle,
      body: finalBody,
      image,
      data: { ...data, isPromotional: "true" },
    });
  }
}
