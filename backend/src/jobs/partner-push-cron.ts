import cron from "node-cron";
import { DeliveryPartner } from "../modules/delivery/delivery.model";
import { NotificationEvent } from "../modules/notification/notification-event.model";
import { notificationQueue } from "./queues";
import { NotificationService } from "../modules/notification/notification.service";
import { selectPartnerTemplate, getActivePartnerTemplateCount } from "../modules/notification/partner-template-selector";
import { notifConfig } from "../modules/notification/notification.config";
import type { NotificationJobData } from "./workers/notification.worker";

const PERIODIC_TYPES_PATTERN = /^(BUSY_HOUR|LUNCH_PEAK|DINNER_PEAK|RAINY_WEATHER|INCENTIVE|OFF_DUTY_NUDGE|MORNING_START)$/;

const getISTDateString = (): string => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + istOffset).toISOString().split("T")[0];
};

const isWithinDaytimeWindow = (): boolean => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const hour = new Date(Date.now() + istOffset).getUTCHours();
  return hour >= notifConfig.dayStartHour && hour < notifConfig.dayEndHour;
};

const processPartnerPeriodicNotification = async (
  partnerId: string,
  userId: string,
  name: string,
  isOnline: boolean,
  currentOrderId: string | null | undefined
): Promise<"sent" | "skipped" | "failed"> => {
  const tag = `[PartnerPushCron][partner:${partnerId}]`;
  const todayIst = getISTDateString();
  const minIntervalMs = notifConfig.minIntervalHours * 60 * 60 * 1000;
  const minIntervalCutoff = new Date(Date.now() - minIntervalMs);

  // ─── Gate 1: Daily limit ──────────────────────────────────────────────────
  const todayCount = await NotificationEvent.countDocuments({
    userId,
    userType: "PARTNER",
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
    userType: "PARTNER",
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
  if (currentOrderId) {
    console.log(`${tag} ⏭️  SKIP — partner "${name}" has active order`);
    return "skipped";
  }

  // ─── All gates passed: select template ───────────────────────────────────
  const selected = await selectPartnerTemplate(userId, undefined);

  if (!selected) {
    console.log(`${tag} ⏭️  SKIP — template selector returned null (no eligible templates)`);
    return "skipped";
  }

  // ─── Gate 4: OFF_DUTY_NUDGE applicability ────────────────────────────────
  if (selected.category === "OFF_DUTY_NUDGE" && isOnline) {
    console.log(`${tag} ⏭️  SKIP — partner is already online, no need for off-duty nudge`);
    return "skipped";
  }

  const deduplicationKey = `periodic_partner_${partnerId}_${selected.templateId}_${todayIst}`;

  const jobData: NotificationJobData = {
    userId: partnerId,
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
    }
  };

  try {
    if (notificationQueue) {
      await notificationQueue.add("send-push", jobData, {
        attempts: notifConfig.retryAttempts,
        backoff: { type: "exponential", delay: notifConfig.retryBaseDelayMs },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 50 },
        jobId: deduplicationKey,
      });
      console.log(`${tag} 📤 Queued | template: "${selected.templateId}" | cat: ${selected.category} | lang: ${selected.language}`);
    } else {
      console.log(`${tag} 🔁 Fallback direct send (no Redis) | template: "${selected.templateId}"`);
      await NotificationService.sendToPartner(partnerId, {
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

export const initPartnerPushCron = (): void => {
  if (!notifConfig.periodicEnabled) {
    console.log("[PartnerPushCron] ⏸️  Periodic notifications disabled.");
    return;
  }

  const templateCount = getActivePartnerTemplateCount();
  console.log("[PartnerPushCron] 🚀 Initializing partner engagement notification cron...");
  console.log(`[PartnerPushCron] 📚 Template library: ${templateCount} active templates`);

  cron.schedule("0 * * * *", async () => {
    if (!isWithinDaytimeWindow()) {
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istHour = new Date(Date.now() + istOffset).getUTCHours();
      console.log(`[PartnerPushCron] 🌙 Outside window (IST hour: ${istHour}). Skipping.`);
      return;
    }

    const delayMs = Math.floor(Math.random() * 20 * 60 * 1000);
    const delayMin = Math.round(delayMs / 60000);
    console.log(`[PartnerPushCron] ⏰ Daytime window active. Firing batch in ${delayMin} min...`);

    setTimeout(() => { void runPartnerPeriodicBatch(); }, delayMs);
  });

  console.log("[PartnerPushCron] ✅ Cron scheduled — runs at :00 each hour, daytime window only.");
};

export const runPartnerPeriodicBatch = async (): Promise<{
  sent: number;
  skipped: number;
  failed: number;
  total: number;
}> => {
  console.log("[PartnerPushCron] 🔔 Starting periodic notification batch...");
  const startTime = Date.now();

  interface LeanPartner {
    _id: { toString(): string };
    userId: { toString(): string };
    fullName: string;
    fcmTokens: string[];
    isOnline: boolean;
    currentOrderId?: { toString(): string } | null;
  }

  const partners = await DeliveryPartner.find({
    status: "approved",
    fcmTokens: { $exists: true, $not: { $size: 0 } },
  })
    .select("_id userId fullName fcmTokens isOnline currentOrderId")
    .lean<LeanPartner[]>();

  const total = partners.length;
  console.log(`[PartnerPushCron] 🛵 Found ${total} eligible partner(s) with FCM tokens`);

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const BATCH_SIZE = 20;
  for (let i = 0; i < partners.length; i += BATCH_SIZE) {
    const batch = partners.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((p) =>
        processPartnerPeriodicNotification(
          p._id.toString(),
          p.userId.toString(),
          p.fullName,
          p.isOnline,
          p.currentOrderId?.toString()
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
        console.error("[PartnerPushCron] ❌ Unhandled batch rejection:", result.reason);
      }
    }

    if (i + BATCH_SIZE < partners.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(
    `[PartnerPushCron] ✅ Batch complete in ${elapsed}s — sent: ${sent} | skipped: ${skipped} | failed: ${failed} | total: ${total}`
  );

  return { sent, skipped, failed, total };
};
