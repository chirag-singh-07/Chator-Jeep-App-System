import cron from "node-cron";
import { logger } from "../common/utils/logger";
import { User } from "../modules/user/user.model";
import { Notification } from "../modules/notification/notification.model";
import { NotificationService } from "../modules/notification/notification.service";

interface NotificationTemplate {
  title: string;
  body: string;
}

const TEMPLATES: Record<string, NotificationTemplate[]> = {
  BREAKFAST: [
    {
      title: "Aapki Morning Chai & Samosa Ready Hai! ☕",
      body: "Garam Samosas, Chai & Fresh Parathas delivered hot! Start your day with a delicious breakfast 🥐",
    },
    {
      title: "Morning Hunger Pangs? 🍳",
      body: "Crispy South Indian Dosa & Omelettes waiting for you. Order fresh breakfast now!",
    },
  ],
  LUNCH: [
    {
      title: "Bhookh Lagi Hai Boss? 🍔",
      body: "Hot Biryani, Paneer Butter Masala & Naan delivered in 30 mins! Tap to get FLAT 50% OFF 🍛",
    },
    {
      title: "Lunch Time Special Offer! 🍕",
      body: "Cheesy Pizzas & Chole Bhature delivered right to your table. Order now with code CHATORI50!",
    },
  ],
  SNACKS: [
    {
      title: "Shaam Ki Chhoti Bhookh? 😋",
      body: "Chatpate Momos, Crispy Fries & Cold Coffee calling! Grab your 4 PM snack bite now 🥤",
    },
    {
      title: "Evening Chai & Snacks Break! ☕",
      body: "Kachoris, Bread Pakodas & Fresh Juice delivered fast. Satisfy your evening cravings!",
    },
  ],
  DINNER: [
    {
      title: "Aaj Raat Khane Mein Kya Hai? 🍲",
      body: "Delicious Tandoori Chicken, Dal Makhani & Desserts delivered in under 30 mins! Order Dinner 🍷",
    },
    {
      title: "Dinner Plan Sorted! 🎉",
      body: "Top-rated cloud kitchens near you are serving fresh hot meals. Tap to order your dinner now!",
    },
  ],
  LATE_NIGHT: [
    {
      title: "Late Night Cravings? 🌙",
      body: "We are open! Satisfy your midnight hunger with hot burgers, rolls & ice creams 🍦",
    },
    {
      title: "Midnight Hunger Attack? 🍕",
      body: "Hot cheesy slices & chocolates delivered to your doorstep. Satisfy midnight cravings now!",
    },
  ],
  GENERAL: [
    {
      title: "Special Offer Sirf Aapke Liye! 💥",
      body: "Use code CHATORI50 for FLAT 50% OFF on top-rated restaurants near you! Tap to order 🚀",
    },
    {
      title: "Khana Mangwaya Kya? 🚀",
      body: "Discover trending dishes & street food favourites in your city with lightning fast delivery!",
    },
  ],
};

function getTemplateForCurrentTime(): NotificationTemplate {
  const currentHour = new Date().getHours();
  let pool: NotificationTemplate[];

  if (currentHour >= 7 && currentHour < 11) {
    pool = TEMPLATES.BREAKFAST;
  } else if (currentHour >= 11 && currentHour < 16) {
    pool = TEMPLATES.LUNCH;
  } else if (currentHour >= 16 && currentHour < 19) {
    pool = TEMPLATES.SNACKS;
  } else if (currentHour >= 19 && currentHour < 23) {
    pool = TEMPLATES.DINNER;
  } else if (currentHour >= 23 || currentHour < 4) {
    pool = TEMPLATES.LATE_NIGHT;
  } else {
    pool = TEMPLATES.GENERAL;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
  Dispatch periodic push notifications to active user app users.
 */
export async function sendPeriodicUserPushNotifications(): Promise<void> {
  try {
    const template = getTemplateForCurrentTime();
    logger.cron.info(`📢 Triggering periodic 3-hour user push notification: "${template.title}"`);

    // 1. Fetch all customer user IDs to create in-app notifications
    const users = await User.find({ role: "CUSTOMER" }).select("_id fcmTokens");
    
    if (users.length > 0) {
      // Save in-app notification records for all customers
      const notifDocs = users.map(user => ({
        userId: user._id,
        userType: "CUSTOMER",
        title: template.title,
        body: template.body,
        type: "PROMOTIONAL",
        data: { isPromotional: "true", discountCode: "CHATORI50" }
      }));

      await Notification.insertMany(notifDocs);
    }

    // 2. Broadcast push notification via FCM to CUSTOMERS
    await NotificationService.broadcast("CUSTOMERS", {
      title: template.title,
      body: template.body,
      data: {
        type: "PROMOTIONAL",
        clickAction: "HOME_PROMO",
        discountCode: "CHATORI50",
      }
    });

    logger.cron.info(`✅ Successfully dispatched periodic push notification to ${users.length} customer accounts.`);
  } catch (error) {
    logger.cron.error(`❌ Error executing periodic user push notification cron: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
  Initialize background cron job running every 3 hours (0 * / 3 * * *).
 */
export function initUserPushCron(): void {
  logger.cron.info("🚀 Initializing 3-hour User App Push Notification Cron Job...");

  // Schedule cron to run every 3 hours at minute 0
  cron.schedule("0 */3 * * *", () => {
    void sendPeriodicUserPushNotifications();
  });

  // Run initial test execution after 15 seconds on boot
  setTimeout(() => {
    logger.cron.info("⚡ Executing initial boot verification check for user push notifications...");
    void sendPeriodicUserPushNotifications();
  }, 15000);
}
