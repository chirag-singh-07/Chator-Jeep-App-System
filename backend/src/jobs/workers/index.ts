import { Worker } from "bullmq";
import { redisConnection } from "../../config/redis";
import { cancelPendingOrder } from "./order.worker";
import { processNotification } from "./notification.worker";

let workersInitialized = false;

export const initWorkers = (): void => {
  if (workersInitialized) {
    return;
  }
  if (!redisConnection) {
    return;
  }

  new Worker(
    "orderQueue",
    async (job) => {
      if (job.name === "auto-cancel") {
        await cancelPendingOrder(job.data.orderId as string);
      }
    },
    { connection: redisConnection }
  );

  new Worker(
    "notificationQueue",
    async (job) => {
      await processNotification(job.data);
    },
    { connection: redisConnection }
  );

  workersInitialized = true;
};
