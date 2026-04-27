import { getFirebase } from "../../config/firebase";
import { getIO } from "../../sockets";
import { Notification, NotificationType } from "./notification.model";
import { User } from "../user/user.model";
import { Restaurant } from "../restaurant/restaurant.model";
import { DeliveryPartner } from "../delivery/delivery.model";

export class NotificationService {
  /**
   * Send notification to a Customer
   */
  static async sendToCustomer(userId: string, payload: { title: string; body: string; type: NotificationType; data?: any }) {
    await Notification.create({
      userId,
      userType: "CUSTOMER",
      ...payload
    });

    try {
      const io = getIO();
      io.to(`user_${userId}`).emit("notification", payload);
    } catch (err) {}

    const user = await User.findById(userId).select("fcmTokens");
    if (user && user.fcmTokens && user.fcmTokens.length > 0) {
      await this.sendPush(user.fcmTokens, payload, "User", userId);
    }
  }

  /**
   * Send notification to a Delivery Partner
   */
  static async sendToPartner(partnerId: string, payload: { title: string; body: string; type: NotificationType; data?: any }) {
    const partner = await DeliveryPartner.findById(partnerId).select("fcmTokens userId");
    if (!partner) return;

    await Notification.create({
      userId: partner.userId,
      userType: "PARTNER",
      ...payload
    });

    try {
      const io = getIO();
      io.to(`user_${partner.userId.toString()}`).emit("notification", payload);
      // For legacy/specific compatibility
      io.to(`rider_${partner.userId.toString()}`).emit("notification", payload);
    } catch (err) {}

    if (partner.fcmTokens && partner.fcmTokens.length > 0) {
      await this.sendPush(partner.fcmTokens, payload, "DeliveryPartner", partnerId);
    }
  }

  /**
   * Send notification to a Restaurant
   */
  static async sendToRestaurant(restaurantId: string, payload: { title: string; body: string; type: NotificationType; data?: any }) {
    const restaurant = await Restaurant.findById(restaurantId).select("fcmTokens ownerId");
    if (!restaurant) return;

    await Notification.create({
      userId: restaurant.ownerId,
      userType: "RESTAURANT",
      ...payload
    });

    try {
      const io = getIO();
      io.to(`user_${restaurant.ownerId.toString()}`).emit("notification", payload);
      io.to(`restaurant_${restaurantId}`).emit("notification", payload);
    } catch (err) {}

    if (restaurant.fcmTokens && restaurant.fcmTokens.length > 0) {
      await this.sendPush(restaurant.fcmTokens, payload, "Restaurant", restaurantId);
    }
  }

  private static async sendPush(tokens: string[], payload: { title: string; body: string; type?: string; data?: any }, modelName: string, id: string) {
    const firebase = getFirebase();
    if (!firebase) return;

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...(payload.data || {}),
        type: payload.type || "",
      },
      tokens: tokens,
    };

    try {
      const response = await firebase.messaging().sendEachForMulticast(message);
      
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });

        if (failedTokens.length > 0) {
          // Cast to any to avoid union-type call signature issues across different model classes
          const Model: any = modelName === "User" ? User : (modelName === "Restaurant" ? Restaurant : DeliveryPartner);
          await Model.findByIdAndUpdate(id, {
            $pull: { fcmTokens: { $in: failedTokens } }
          });
        }
      }
    } catch (error) {
      console.error(`Error sending push to ${modelName} ${id}:`, error);
    }
  }

  static async broadcast(audience: "ALL" | "CUSTOMERS" | "PARTNERS" | "RESTAURANTS", payload: { title: string; body: string; image?: string; data?: any }) {
    const firebase = getFirebase();
    if (!firebase) return;

    let tokens: string[] = [];
    
    if (audience === "ALL" || audience === "CUSTOMERS") {
      const users = await User.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } }).select("fcmTokens");
      tokens = tokens.concat(users.flatMap(u => u.fcmTokens));
    }
    
    if (audience === "ALL" || audience === "PARTNERS") {
      const partners = await DeliveryPartner.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } }).select("fcmTokens");
      tokens = tokens.concat(partners.flatMap(p => p.fcmTokens));
    }

    if (audience === "ALL" || audience === "RESTAURANTS") {
      const restaurants = await Restaurant.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } }).select("fcmTokens");
      tokens = tokens.concat(restaurants.flatMap(r => r.fcmTokens));
    }

    if (tokens.length === 0) return;

    // Send in batches of 500 (FCM limit)
    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      await firebase.messaging().sendEachForMulticast({
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: {
          ...payload.data,
          type: "PROMOTIONAL",
        },
        tokens: batch,
      });
    }
  }
}
