import { createServer } from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { ensureRedisConnection, isRedisEnabled } from "./config/redis";
import { initSocket } from "./sockets";
import { initKeepAlive } from "./common/utils/cron";

const bootstrap = async (): Promise<void> => {
  await connectDB();

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
  });
};

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});
