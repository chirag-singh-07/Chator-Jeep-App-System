import cron from "node-cron";
import { User } from "../modules/user/user.model";
import { Order } from "../modules/order/order.model";
import { NotificationEvent } from "../modules/notification/notification-event.model";
import { notificationQueue } from "./queues";
import { NotificationService } from "../modules/notification/notification.service";
import { getPeriodicTemplate } from "../modules/notification/notification.templates";
import { notifConfig } from "../modules/notification/notification.config";
import { ORDER_STATUS } from "../common/constants";
import type { NotificationJobData } from "./workers/notification.worker";

// Statuses that mean the user is actively waiting for food — skip periodic push
const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.PICKED_UP,
];

/**
 * Check if current IST hour is within the configured daytime window.
 */
const isWithinDaytimeWindow = (): boolean => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(Date.now() + istOffset);
  const hour = istNow.getUTCHours();
  return hour >= notifConfig.dayStartHour && hour < notifConfig.dayEndHour;
};

/**
 * Get today's date string in IST (YYYY-MM-DD) for daily limit tracking.
 */
const getISTDateString = (): string => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(Date.now() + istOffset);
  return istNow.toISOString().split("T")[0]; // "2026-08-15"
};

/**
 * Send periodic push to a single user — checks all eligibility rules.
 */
const processUserPeriodicNotification = async (
  userId: string,
  userName: string,
  preferredLanguage: "en" | "hi" | undefined
): Promise<"sent" | "skipped" | "failed"> => {
  const tag = `[PeriodicCron][user:${userId}]`;
  const todayIst = getISTDateString();
  const minIntervalMs = notifConfig.minIntervalHours * 60 * 60 * 1000;
  const minIntervalCutoff = new Date(Date.now() - minIntervalMs);

  // ─── Rule 1: Check daily limit ────────────────────────────────────────────────
  const todayCount = await NotificationEvent.countDocuments({
    userId,
    type: { $in: ["LUNCH_REMINDER", "EVENING_CRAVING", "DINNER_REMINDER", "FOOD_DISCOVERY", "RE_ENGAGEMENT"] },
    sentAt: { $gte: new Date(`${todayIst}T00:00:00.000+05:30`) },
    status: "SENT",
  });

  if (todayCount >= notifConfig.maxDailyCount) {
    console.log(`${tag} ⏭️  SKIP — daily limit reached (${todayCount}/${notifConfig.maxDailyCount})`);
    return "skipped";
  }

  // ─── Rule 2: Check minimum interval since last periodic notification ──────────
  const recentPeriodicEvent = await NotificationEvent.findOne({
    userId,
    type: { $in: ["LUNCH_REMINDER", "EVENING_CRAVING", "DINNER_REMINDER", "FOOD_DISCOVERY", "RE_ENGAGEMENT"] },
    sentAt: { $gte: minIntervalCutoff },
    status: "SENT",
  }).select("_id sentAt");

  if (recentPeriodicEvent) {
    const minutesAgo = Math.round((Date.now() - recentPeriodicEvent.sentAt!.getTime()) / 60000);
    console.log(`${tag} ⏭️  SKIP — sent ${minutesAgo}m ago (min interval: ${notifConfig.minIntervalHours}h)`);
    return "skipped";
  }

  // ─── Rule 3: Check for active order (user is already waiting for food) ────────
  const activeOrder = await Order.findOne({
    userId,
    status: { $in: ACTIVE_ORDER_STATUSES },
  }).select("_id status");

  if (activeOrder) {
    console.log(`${tag} ⏭️  SKIP — user "${userName}" has active order (status: ${activeOrder.status})`);
    return "skipped";
  }

  // ─── All gates passed — generate and send notification ───────────────────────
  const { title, body, language, type } = getPeriodicTemplate(preferredLanguage);

  // Build dedup key: periodic:{userId}:{date}:{type}
  // This ensures user gets at most 1 of each type per day even if cron runs multiple times
  const deduplicationKey = `periodic:${userId}:${todayIst}:${type}`;

  const jobData: NotificationJobData = {
    userId,
    type,
    title,
    body,
    language,
    deduplicationKey,
    data: { screen: "home", isPromotional: "true" },
  };

  try {
    if (notificationQueue) {
      await notificationQueue.add("send-push", jobData, {
        attempts: notifConfig.retryAttempts,
        backoff: { type: "exponential", delay: notifConfig.retryBaseDelayMs },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 50 },
        jobId: deduplicationKey, // BullMQ-level dedup too
      });
      console.log(`${tag} 📤 Queued periodic push for "${userName}" | type: ${type} | lang: ${language}`);
      console.log(`${tag}   title: "${title}"`);
      console.log(`${tag}   body: "${body}"`);
    } else {
      // Fallback: direct send if Redis unavailable
      console.log(`${tag} 🔁 Fallback direct send (no Redis) for "${userName}" | type: ${type}`);
      await NotificationService.sendToCustomer(userId, {
        title,
        body,
        type: type as any,
        data: { screen: "home", isPromotional: "true" },
      });
    }
    return "sent";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${tag} ❌ FAILED to enqueue periodic notification for "${userName}": ${msg}`);
    return "failed";
  }
};

/**
 * Initialize the periodic engagement notification cron.
 *
 * Runs every hour (checks daytime window before doing any work).
 * Adds a random 0-20 minute delay within the hour to avoid thundering-herd
 * on large user bases.
 *
 * Note: Uses setInterval internally NOT as a cron replacement but to
 * add the randomized delay after the cron fires.
 */
export const initUserPushCron = (): void => {
  if (!notifConfig.periodicEnabled) {
    console.log("[UserPushCron] ⏸️  Periodic notifications disabled (PERIODIC_NOTIFICATIONS_ENABLED=false). Skipping.");
    return;
  }

  console.log("[UserPushCron] 🚀 Initializing periodic engagement notification cron (every hour)...");
  console.log(`[UserPushCron] ⚙️  Config: window=${notifConfig.dayStartHour}h-${notifConfig.dayEndHour}h IST | minInterval=${notifConfig.minIntervalHours}h | maxDaily=${notifConfig.maxDailyCount}`);

  // Runs at minute 0 of every hour
  cron.schedule("0 * * * *", async () => {
    if (!isWithinDaytimeWindow()) {
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istHour = new Date(Date.now() + istOffset).getUTCHours();
      console.log(`[UserPushCron] 🌙 Outside daytime window (current IST hour: ${istHour}h). Skipping.`);
      return;
    }

    // Random delay 0-20 min to spread load
    const delayMs = Math.floor(Math.random() * 20 * 60 * 1000);
    console.log(`[UserPushCron] ⏰ Daytime window active. Running in ${Math.round(delayMs / 60000)} minutes...`);

    setTimeout(async () => {
      await runPeriodicBatch();
    }, delayMs);
  });

  console.log("[UserPushCron] ✅ Cron scheduled (runs at :00 of every hour, sends during daytime window only)");
};

/**
 * Process a batch of eligible users for periodic notifications.
 * Called from the cron (after random delay) or on-demand from admin.
 */
export const runPeriodicBatch = async (): Promise<{ sent: number; skipped: number; failed: number; total: number }> => {
  console.log("[UserPushCron] 🔔 Starting periodic notification batch run...");
  const startTime = Date.now();

  // Fetch all ACTIVE users who have at least 1 FCM token
  interface LeanUser {
    _id: { toString(): string };
    name: string;
    fcmTokens: string[];
    preferredLanguage?: "en" | "hi";
  }
  const users = await User.find({
    status: "ACTIVE",
    fcmTokens: { $exists: true, $not: { $size: 0 } },
  }).select("_id name fcmTokens preferredLanguage").lean<LeanUser[]>();

  const total = users.length;
  console.log(`[UserPushCron] 👥 Found ${total} eligible user(s) with FCM tokens`);

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  // Process users in parallel batches of 20 to avoid overwhelming the DB
  const BATCH_SIZE = 20;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((u) =>
        processUserPeriodicNotification(
          u._id.toString(),
          u.name,
          u.preferredLanguage
        )
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value === "sent") sent++;
        else if (result.value === "skipped") skipped++;
        else failed++;
      } else {
        failed++;
      }
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`[UserPushCron] ✅ Batch complete in ${elapsed}s — sent: ${sent} | skipped: ${skipped} | failed: ${failed} | total: ${total}`);

  return { sent, skipped, failed, total };
};
