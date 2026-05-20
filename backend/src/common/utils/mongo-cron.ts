import mongoose from "mongoose";
import { logger } from "./logger";

/**
 * Periodically checks MongoDB connection health and performs maintenance tasks.
 * Ensures database stays responsive and collects diagnostic information.
 */
export const initMongoHealthCheck = () => {
  if (process.env.NODE_ENV !== "production") {
    logger.cron.info("MongoDB health check skipped (only runs in production).");
    return;
  }

  logger.cron.info("🚀 Initializing MongoDB health check cron job...");

  // Run health check every 30 minutes (1,800,000 ms)
  setInterval(async () => {
    try {
      // Check connection status
      if (mongoose.connection.readyState !== 1) {
        logger.cron.warn(`⚠️  MongoDB connection state: ${mongoose.connection.readyState} (expected 1 for connected)`);
        return;
      }

      // Ping the MongoDB server
      const admin = mongoose.connection.db?.admin();
      if (admin) {
        const result = await admin.ping();
        if (result.ok === 1) {
          logger.cron.info("✅ MongoDB health check passed - server is responsive");
        } else {
          logger.cron.warn("⚠️  MongoDB ping returned unexpected response:", result);
        }
      }
    } catch (error) {
      logger.cron.error(`❌ MongoDB health check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, 30 * 60 * 1000); // 30 minutes
};
