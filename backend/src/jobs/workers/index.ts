import { Worker } from "bullmq";
import { redisConnection } from "../../config/redis";
import { cancelPendingOrder } from "./order.worker";
import { processNotification } from "./notification.worker";
import { notifConfig } from "../../modules/notification/notification.config";

let workersInitialized = false;

export const initWorkers = (): void => {
  if (workersInitialized) {
    return;
  }
  if (!redisConnection) {
    console.warn("[Workers] Redis not available — BullMQ workers skipped.");
    return;
  }

  // ─── Order Worker ─────────────────────────────────────────────────────────────
  const orderWorker = new Worker(
    "orderQueue",
    async (job) => {
      if (job.name === "auto-cancel") {
        await cancelPendingOrder(job.data.orderId as string);
      }
    },
    { connection: redisConnection }
  );

  orderWorker.on("failed", (job, err) => {
    console.error(`[OrderWorker] ❌ Job ${job?.id} (${job?.name}) failed: ${err.message}`);
  });

  // ─── Notification Worker ──────────────────────────────────────────────────────
  const notificationWorker = new Worker(
    "notificationQueue",
    async (job) => {
      await processNotification(job.data);
    },
    {
      connection: redisConnection,
      // Concurrency: process up to 5 notification jobs in parallel
      concurrency: 5,
    }
  );

  notificationWorker.on("completed", (job) => {
    console.log(`[NotificationWorker] ✅ Job ${job.id} completed successfully`);
  });

  notificationWorker.on("failed", (job, err) => {
    const attempts = job?.attemptsMade ?? 0;
    const maxAttempts = notifConfig.retryAttempts;
    if (attempts >= maxAttempts) {
      console.error(`[NotificationWorker] ❌ Job ${job?.id} PERMANENTLY FAILED after ${attempts} attempts: ${err.message}`);
    } else {
      console.warn(`[NotificationWorker] ⚠️  Job ${job?.id} failed (attempt ${attempts}/${maxAttempts}), will retry: ${err.message}`);
    }
  });

  notificationWorker.on("error", (err) => {
    console.error(`[NotificationWorker] Worker error: ${err.message}`);
  });

  workersInitialized = true;
  console.log("[Workers] ✅ orderQueue and notificationQueue workers initialized");
};
