import https from "https";
import { env } from "../../config/env";
import { logger } from "./logger";

/**
 * Periodically pings the backend to keep it from sleeping on Render's free tier.
 * Render spins down free-tier instances after 15 minutes of inactivity.
 */
export const initKeepAlive = () => {
  const url = env.BACKEND_URL;

  if (!url) {
    logger.cron.error("BACKEND_URL is not defined in environment variables. Keep-alive cron job skipped.");
    return;
  }

  if (env.NODE_ENV !== "production") {
    logger.cron.info("Keep-alive cron job skipped (only runs in production).");
    return;
  }

  logger.cron.info("🚀 Initializing keep-alive cron job...");

  // Ping every 14 minutes (840,000 ms)
  setInterval(() => {
    https.get(`${url}/health`, (res) => {
      logger.cron.info(`📡 Keep-alive ping sent to ${url}/health. Status: ${res.statusCode}`);
    }).on("error", (err) => {
      logger.cron.error(`❌ Keep-alive ping failed: ${err.message}`);
    });
  }, 14 * 60 * 1000);
};
