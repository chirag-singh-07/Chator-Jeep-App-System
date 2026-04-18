import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis";

export const orderQueue = redisConnection
  ? new Queue("orderQueue", { connection: redisConnection })
  : null;

export const notificationQueue = redisConnection
  ? new Queue("notificationQueue", { connection: redisConnection })
  : null;
