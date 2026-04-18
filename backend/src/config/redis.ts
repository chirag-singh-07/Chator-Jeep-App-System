import IORedis from "ioredis";
import { env } from "./env";

const hasProtocol = (url: string): boolean => /^[a-z]+:\/\//i.test(url);
const normalizedRedisUrl = env.REDIS_URL
  ? hasProtocol(env.REDIS_URL)
    ? env.REDIS_URL
    : `redis://${env.REDIS_URL}`
  : undefined;

let redisDisabled = false;
let authHintShown = false;

export const isRedisEnabled = Boolean(normalizedRedisUrl);

export const redisConnection = isRedisEnabled
  ? new IORedis(normalizedRedisUrl as string, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      retryStrategy: (attempt) => {
        if (!env.REDIS_REQUIRED && attempt > 2) {
          return null;
        }
        return Math.min(attempt * 200, 2000);
      }
    })
  : null;

const disableRedis = (): void => {
  redisDisabled = true;
  redisConnection?.disconnect();
};

const isAuthError = (message: string): boolean =>
  message.includes("NOAUTH") || message.includes("WRONGPASS");

export const ensureRedisConnection = async (): Promise<boolean> => {
  if (!redisConnection || redisDisabled) {
    return false;
  }

  try {
    if (redisConnection.status === "wait") {
      await redisConnection.connect();
    }
    await redisConnection.ping();
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (env.REDIS_REQUIRED) {
      console.error("Redis connection failed (required):", message);
      process.exit(1);
    }

    if (!authHintShown && isAuthError(message)) {
      authHintShown = true;
      console.warn(
        "Redis auth failed. Add REDIS_PASSWORD (and REDIS_USERNAME if needed), or use redis://:password@host:port in REDIS_URL."
      );
    } else {
      console.warn("Redis connection failed (optional):", message);
    }

    disableRedis();
    return false;
  }
};

if (redisConnection) {
  redisConnection.on("error", (error) => {
    if (redisDisabled) {
      return;
    }

    const message = error.message;
    if (env.REDIS_REQUIRED) {
      console.error("Redis connection failed (required):", message);
      process.exit(1);
    }

    if (!authHintShown && isAuthError(message)) {
      authHintShown = true;
      console.warn(
        "Redis auth failed. Add REDIS_PASSWORD (and REDIS_USERNAME if needed), or use redis://:password@host:port in REDIS_URL."
      );
    } else {
      console.warn("Redis connection failed (optional):", message);
    }

    disableRedis();
  });
}
