import cron from "node-cron";
import { User } from "../modules/user/user.model";
import { Order } from "../modules/order/order.model";
import { NotificationEvent } from "../modules/notification/notification-event.model";
import { notificationQueue } from "./queues";
import { NotificationService } from "../modules/notification/notification.service";
import { selectTemplate, getActiveTemplateCount } from "../modules/notification/template-selector";
import { notifConfig } from "../modules/notification/notification.config";
import { ORDER_STATUS } from "../common/constants";
import type { NotificationJobData } from "./workers/notification.worker";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Statuses that mean the user is actively waiting for food — skip periodic push */
const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.PICKED_UP,
];

/**
 * Periodic notification types — used for daily limit counting.
 * These are the engagement categories, NOT order lifecycle types.
 */
const PERIODIC_TYPES_PATTERN = /^(BREAKFAST|LUNCH|DINNER|EVENING_SNACK|MIDNIGHT_CRAVINGS|CRAVINGS|MOVIE_NIGHT|GAMING|STUDY_BREAK|WORK_BREAK|FRIENDS|FAMILY|WEEKEND|RAINY_WEATHER|HOT_WEATHER|SPORTS|PARTY|LAZY_DAY|SELF_TREAT|FOOD_DISCOVERY|RE_ENGAGEMENT|FUN_CONVERSATIONAL|LATE_NIGHT)$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get current IST date string (YYYY-MM-DD) for daily limit tracking */
const getISTDateString = (): string => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + istOffset).toISOString().split("T")[0];
};

/** Check if current IST hour is within the configured daytime window */
const isWithinDaytimeWindow = (): boolean => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const hour = new Date(Date.now() + istOffset).getUTCHours();
  return hour >= notifConfig.dayStartHour && hour < notifConfig.dayEndHour;
};

// ─── Per-User Processing ──────────────────────────────────────────────────────

/**
 * Evaluate and dispatch a periodic engagement notification for a single user.
 * Runs all eligibility gates, selects the best template, enqueues/sends.
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

  // ─── Gate 1: Daily limit ──────────────────────────────────────────────────
  const todayCount = await NotificationEvent.countDocuments({
    userId,
    type: { $regex: PERIODIC_TYPES_PATTERN },
    sentAt: { $gte: new Date(`${todayIst}T00:00:00.000+05:30`) },
    status: "SENT",
  });

  if (todayCount >= notifConfig.maxDailyCount) {
    console.log(`${tag} ⏭️  SKIP — daily limit reached (${todayCount}/${notifConfig.maxDailyCount})`);
    return "skipped";
  }

  // ─── Gate 2: Minimum interval since last periodic notification ────────────
  const recentPeriodicEvent = await NotificationEvent.findOne({
    userId,
    type: { $regex: PERIODIC_TYPES_PATTERN },
    sentAt: { $gte: minIntervalCutoff },
    status: "SENT",
  }).select("_id sentAt");

  if (recentPeriodicEvent) {
    const minutesAgo = Math.round((Date.now() - recentPeriodicEvent.sentAt!.getTime()) / 60000);
    console.log(`${tag} ⏭️  SKIP — sent ${minutesAgo}m ago (min interval: ${notifConfig.minIntervalHours}h)`);
    return "skipped";
  }

  // ─── Gate 3: Active order check ───────────────────────────────────────────
  const activeOrder = await Order.findOne({
    userId,
    status: { $in: ACTIVE_ORDER_STATUSES },
  }).select("_id status");

  if (activeOrder) {
    console.log(`${tag} ⏭️  SKIP — user "${userName}" has active order (status: ${activeOrder.status})`);
    return "skipped";
  }

  // ─── All gates passed: select template ───────────────────────────────────
  const selected = await selectTemplate(userId, preferredLanguage);

  if (!selected) {
    console.log(`${tag} ⏭️  SKIP — template selector returned null (no eligible templates)`);
    return "skipped";
  }

  // Dedup key: ensures this exact template is only sent once per user per day
  const deduplicationKey = `periodic:${userId}:${selected.templateId}:${todayIst}`;

  const jobData: NotificationJobData = {
    userId,
    type: selected.type,
    title: selected.title,
    body: selected.body,
    language: selected.language,
    deduplicationKey,
    data: {
      screen: selected.screen,
      isPromotional: "true",
      templateId: selected.templateId,
      category: selected.category,
    },
  };

  try {
    if (notificationQueue) {
      await notificationQueue.add("send-push", jobData, {
        attempts: notifConfig.retryAttempts,
        backoff: { type: "exponential", delay: notifConfig.retryBaseDelayMs },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 50 },
        jobId: deduplicationKey, // BullMQ-level dedup
      });
      console.log(`${tag} 📤 Queued | template: "${selected.templateId}" | cat: ${selected.category} | lang: ${selected.language}`);
      console.log(`${tag}   title: "${selected.title}"`);
      console.log(`${tag}   body:  "${selected.body}"`);
    } else {
      // Fallback: direct send if Redis unavailable
      console.log(`${tag} 🔁 Fallback direct send (no Redis) | template: "${selected.templateId}"`);
      await NotificationService.sendToCustomer(userId, {
        title: selected.title,
        body: selected.body,
        type: selected.type as any,
        data: {
          screen: selected.screen,
          isPromotional: "true",
          templateId: selected.templateId,
        },
      });
    }
    return "sent";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${tag} ❌ FAILED to enqueue | template: "${selected.templateId}" | error: ${msg}`);
    return "failed";
  }
};

// ─── Cron Initialization ──────────────────────────────────────────────────────

/**
 * Initialize the periodic engagement notification cron.
 *
 * Runs at :00 of every hour (IST daytime window: 10am-10pm).
 * Adds a random 0-20 min delay to spread load and avoid thundering-herd.
 */
export const initUserPushCron = (): void => {
  if (!notifConfig.periodicEnabled) {
    console.log("[UserPushCron] ⏸️  Periodic notifications disabled (PERIODIC_NOTIFICATIONS_ENABLED=false).");
    return;
  }

  const templateCount = getActiveTemplateCount();
  console.log("[UserPushCron] 🚀 Initializing smart engagement notification cron...");
  console.log(`[UserPushCron] 📚 Template library: ${templateCount} active templates`);
  console.log(`[UserPushCron] ⚙️  window: ${notifConfig.dayStartHour}h-${notifConfig.dayEndHour}h IST | minInterval: ${notifConfig.minIntervalHours}h | maxDaily: ${notifConfig.maxDailyCount} | templateCooldown: ${notifConfig.templateCooldownDays}d`);

  cron.schedule("0 * * * *", async () => {
    if (!isWithinDaytimeWindow()) {
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istHour = new Date(Date.now() + istOffset).getUTCHours();
      console.log(`[UserPushCron] 🌙 Outside window (IST hour: ${istHour}). Skipping.`);
      return;
    }

    // Random delay 0-20 min to spread load
    const delayMs = Math.floor(Math.random() * 20 * 60 * 1000);
    const delayMin = Math.round(delayMs / 60000);
    console.log(`[UserPushCron] ⏰ Daytime window active. Firing batch in ${delayMin} min...`);

    setTimeout(() => { void runPeriodicBatch(); }, delayMs);
  });

  console.log("[UserPushCron] ✅ Cron scheduled — runs at :00 each hour, daytime window only.");
};

// ─── Batch Runner ────────────────────────────────────────────────────────────

/**
 * Process all eligible users for periodic engagement notifications.
 * Called by the cron (post-delay) or directly from the admin trigger endpoint.
 *
 * @returns Batch statistics: { sent, skipped, failed, total }
 */
export const runPeriodicBatch = async (): Promise<{
  sent: number;
  skipped: number;
  failed: number;
  total: number;
}> => {
  console.log("[UserPushCron] 🔔 Starting periodic notification batch...");
  const startTime = Date.now();

  interface LeanUser {
    _id: { toString(): string };
    name: string;
    fcmTokens: string[];
    preferredLanguage?: "en" | "hi";
  }

  // Fetch active users with at least 1 registered FCM token
  const users = await User.find({
    status: "ACTIVE",
    fcmTokens: { $exists: true, $not: { $size: 0 } },
  })
    .select("_id name fcmTokens preferredLanguage")
    .lean<LeanUser[]>();

  const total = users.length;
  console.log(`[UserPushCron] 👥 Found ${total} eligible user(s) with FCM tokens`);

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  // Process in batches of 20 to avoid overwhelming MongoDB
  const BATCH_SIZE = 20;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((u) =>
        processUserPeriodicNotification(u._id.toString(), u.name, u.preferredLanguage)
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value === "sent") sent++;
        else if (result.value === "skipped") skipped++;
        else failed++;
      } else {
        failed++;
        console.error("[UserPushCron] ❌ Unhandled batch rejection:", result.reason);
      }
    }

    // Small delay between batches to reduce DB pressure
    if (i + BATCH_SIZE < users.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(
    `[UserPushCron] ✅ Batch complete in ${elapsed}s — sent: ${sent} | skipped: ${skipped} | failed: ${failed} | total: ${total}`
  );

  return { sent, skipped, failed, total };
};
