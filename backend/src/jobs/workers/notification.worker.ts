import { NotificationService } from "../../modules/notification/notification.service";
import { NotificationEvent } from "../../modules/notification/notification-event.model";
import { User } from "../../modules/user/user.model";
import { notifConfig } from "../../modules/notification/notification.config";

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  body: string;
  language: "en" | "hi";
  deduplicationKey: string;
  orderId?: string;
  data?: Record<string, any>;
}

/**
 * Core worker function — processes a single notification job from BullMQ queue.
 *
 * Flow:
 * 1. Idempotency check (MongoDB deduplicationKey)
 * 2. Eligibility gate (user exists, has tokens, is active)
 * 3. Send push via Firebase FCM
 * 4. Save in-app Notification record
 * 5. Mark NotificationEvent as SENT or FAILED
 * 6. Structured console logs for VPS visibility
 */
export const processNotification = async (data: unknown): Promise<void> => {
  const job = data as NotificationJobData;

  if (!notifConfig.enabled) {
    console.log(`[NotificationWorker] ⏸️  Notifications disabled — skipping job for user ${job.userId} type=${job.type}`);
    return;
  }

  const tag = `[NotificationWorker][${job.type}][user:${job.userId}]`;

  console.log(`${tag} 📬 Processing notification job`);
  console.log(`${tag}   deduplicationKey: ${job.deduplicationKey}`);
  console.log(`${tag}   title: "${job.title}"`);
  console.log(`${tag}   body: "${job.body}"`);

  // ─── 1. Idempotency Check ────────────────────────────────────────────────────
  // Atomically insert a PENDING event. If deduplicationKey already exists
  // with status SENT, the document will be found and we skip sending.
  let eventDoc;
  try {
    eventDoc = await NotificationEvent.findOneAndUpdate(
      { deduplicationKey: job.deduplicationKey },
      {
        $setOnInsert: {
          userId: job.userId,
          orderId: job.orderId || null,
          type: job.type,
          title: job.title,
          body: job.body,
          language: job.language || "en",
          status: "PENDING",
          deduplicationKey: job.deduplicationKey,
          // Store templateId at top-level for efficient cooldown index queries
          templateId: (job.data as any)?.templateId || null,
          retryCount: 0,
          data: job.data || {},
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err: any) {
    // Duplicate key error means another worker beat us — skip
    if (err.code === 11000) {
      console.log(`${tag} 🔒 SKIPPED — duplicate key, another worker already handled this notification`);
      return;
    }
    throw err;
  }

  if (eventDoc.status === "SENT") {
    console.log(`${tag} ✅ SKIPPED — already sent at ${eventDoc.sentAt?.toISOString()}`);
    return;
  }

  if (eventDoc.status === "SKIPPED") {
    console.log(`${tag} ⏭️  SKIPPED — previously marked as skip`);
    return;
  }

  // ─── 2. Eligibility Gate ─────────────────────────────────────────────────────
  const user = await User.findById(job.userId).select("fcmTokens status name email");
  if (!user) {
    console.log(`${tag} ❌ SKIPPED — user not found`);
    await NotificationEvent.findByIdAndUpdate(eventDoc._id, {
      status: "SKIPPED",
      failureReason: "User not found",
    });
    return;
  }

  if (user.status !== "ACTIVE") {
    console.log(`${tag} ⏭️  SKIPPED — user status is ${user.status}`);
    await NotificationEvent.findByIdAndUpdate(eventDoc._id, {
      status: "SKIPPED",
      failureReason: `User status: ${user.status}`,
    });
    return;
  }

  if (!user.fcmTokens || user.fcmTokens.length === 0) {
    console.log(`${tag} ⏭️  SKIPPED — user has no FCM tokens (name: ${user.name})`);
    await NotificationEvent.findByIdAndUpdate(eventDoc._id, {
      status: "SKIPPED",
      failureReason: "No FCM tokens",
    });
    return;
  }

  console.log(`${tag} 🔔 Sending push to user "${user.name}" (${user.fcmTokens.length} device(s))`);

  // ─── 3. Send via NotificationService (handles FCM + socket + in-app Notification record) ─
  try {
    await NotificationService.sendToCustomer(job.userId, {
      title: job.title,
      body: job.body,
      type: job.type as any,
      data: {
        ...(job.data || {}),
        language: job.language || "en",
        deduplicationKey: job.deduplicationKey,
      },
    });

    // ─── 4. Mark as SENT ──────────────────────────────────────────────────────
    await NotificationEvent.findByIdAndUpdate(eventDoc._id, {
      status: "SENT",
      sentAt: new Date(),
      $inc: { retryCount: 1 },
    });

    console.log(`${tag} ✅ SUCCESS — push notification sent to user "${user.name}" (${user.email})`);
    console.log(`${tag}   tokens: ${user.fcmTokens.length} device(s) | type: ${job.type} | lang: ${job.language}`);

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await NotificationEvent.findByIdAndUpdate(eventDoc._id, {
      status: "FAILED",
      failureReason: message,
      $inc: { retryCount: 1 },
    });

    console.error(`${tag} ❌ FAILED — push send error for user "${user.name}" (${user.email}): ${message}`);

    // Re-throw so BullMQ can retry with exponential backoff
    throw error;
  }
};
