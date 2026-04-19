import IORedis from "ioredis";
import { env } from "./env";

// ─── URL Normalization ────────────────────────────────────────────────────────

const hasProtocol = (url: string): boolean => /^[a-z]+:\/\//i.test(url);

const normalizeRedisUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  return hasProtocol(url) ? url : `redis://${url}`;
};

const normalizedRedisUrl = normalizeRedisUrl(env.REDIS_URL);

// ─── State ────────────────────────────────────────────────────────────────────

let redisDisabled = false;
let authHintShown = false;
let redisConnectedLogged = false;

export const isRedisEnabled = Boolean(normalizedRedisUrl);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isAuthError = (message: string): boolean =>
  message.includes("NOAUTH") || message.includes("WRONGPASS");

const disableRedis = (): void => {
  redisDisabled = true;
  redisConnection?.disconnect();
};

const handleRedisError = (rawError: unknown): void => {
  const message =
    rawError instanceof Error ? rawError.message : String(rawError);

  if (env.REDIS_REQUIRED) {
    console.error("Redis connection failed (required):", message);
    process.exit(1);
  }

  if (!authHintShown && isAuthError(message)) {
    authHintShown = true;
    console.warn(
      "Redis auth failed. Add REDIS_PASSWORD (and REDIS_USERNAME if needed), " +
        "or use redis://:password@host:port in REDIS_URL."
    );
  } else {
    console.warn("Redis connection failed (optional):", message);
  }

  disableRedis();
};

// ─── Connection ───────────────────────────────────────────────────────────────

const DISCONNECTED_STATUSES = ["wait", "close", "end", "reconnecting"] as const;

export const redisConnection = isRedisEnabled
  ? new IORedis(normalizedRedisUrl as string, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      retryStrategy: (attempt) => {
        if (!env.REDIS_REQUIRED && attempt > 2) return null;
        return Math.min(attempt * 200, 2000);
      },
    })
  : null;

if (redisConnection) {
  redisConnection.on("error", (error) => {
    if (!redisDisabled) handleRedisError(error);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const ensureRedisConnection = async (): Promise<boolean> => {
  if (!redisConnection || redisDisabled) return false;

  try {
    if (DISCONNECTED_STATUSES.includes(redisConnection.status as any)) {
      await redisConnection.connect();
    }

    await redisConnection.ping();

    if (!redisConnectedLogged) {
      console.log("Redis connected");
      redisConnectedLogged = true;
    }

    return true;
  } catch (error) {
    handleRedisError(error);
    return false;
  }
};