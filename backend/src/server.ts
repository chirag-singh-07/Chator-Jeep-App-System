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
  console.log("🚀 Starting Chator Jeeb API Server...");
  
  await connectDB();
  console.log("✅ MongoDB Connected");
  
  await ensureCategories();
  
  const firebaseApp = initFirebase();
  if (firebaseApp) {
    console.log("🔥 Firebase initialized successfully. Ready to send push notifications.");
  } else {
    console.warn("⚠️ Firebase failed to initialize. Push notifications are disabled.");
  }

  const server = createServer(app);
  initSocket(server);
  console.log("🔌 WebSockets Initialized");

  if (isRedisEnabled) {
    const redisReady = await ensureRedisConnection();
    if (redisReady) {
      initWorkers();
      console.log("⚙️ Redis & BullMQ Workers initialized");
    } else {
      console.warn("⚠️ Redis unavailable: BullMQ workers are not running.");
    }
  } else {
    console.warn("⚠️ Redis disabled: BullMQ workers are not running.");
  }

  server.listen(env.PORT, () => {
    console.log(`✅ Server is running and listening on port ${env.PORT}`);
    initKeepAlive();
    initMongoHealthCheck();
    initUserPushCron();
    initPartnerPushCron();
    console.log("⏰ All Background Cron Jobs Scheduled.");
  });
};

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});
