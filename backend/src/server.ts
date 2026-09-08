import { createServer } from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { ensureRedisConnection, isRedisEnabled } from "./config/redis";
import { initSocket } from "./sockets";
import { initFirebase } from "./config/firebase";
import { initWorkers } from "./jobs/workers";
import { initKeepAlive } from "./common/utils/cron";
import { initMongoHealthCheck } from "./common/utils/mongo-cron";
import { initUserPushCron } from "./jobs/user-push-cron";
import { initPartnerPushCron } from "./jobs/partner-push-cron";
import { ensureCategories } from "./scripts/ensure-categories";

const methods = ['log', 'error', 'warn', 'info'] as const;
methods.forEach((method) => {
  const original = console[method];
  console[method] = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].match(/^\[\d{4}-\d{2}-\d{2}T/)) {
      original.apply(console, args);
    } else {
      original.apply(console, [`[${new Date().toISOString()}]`, ...args]);
    }
  };
});

const bootstrap = async (): Promise<void> => {
  await connectDB();
  await ensureCategories();
  initFirebase();

  const server = createServer(app);
  initSocket(server);
  if (isRedisEnabled) {
    const redisReady = await ensureRedisConnection();
    if (redisReady) {
      initWorkers();
    } else {
      console.warn("Redis unavailable: BullMQ workers are not running.");
    }
  } else {
    console.warn("Redis disabled: BullMQ workers are not running.");
  }

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
    initKeepAlive();
    initMongoHealthCheck();
    initUserPushCron();
    initPartnerPushCron();
  });
};

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});
