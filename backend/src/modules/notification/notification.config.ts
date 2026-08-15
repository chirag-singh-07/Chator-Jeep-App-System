/**
 * Notification system configuration driven by environment variables.
 * All notification-related settings are centralized here.
 * Update environment variables on VPS to change behavior without redeployment.
 */

const toBool = (val: string | undefined, fallback: boolean): boolean => {
  if (val === undefined) return fallback;
  return val.toLowerCase() !== "false" && val !== "0";
};

const toInt = (val: string | undefined, fallback: number): number => {
  const n = parseInt(val ?? "", 10);
  return isNaN(n) ? fallback : n;
};

export const notifConfig = {
  /** Master switch — disable all push notifications */
  enabled: toBool(process.env.NOTIFICATIONS_ENABLED, true),

  /** Enable/disable periodic engagement notifications */
  periodicEnabled: toBool(process.env.PERIODIC_NOTIFICATIONS_ENABLED, true),

  /**
   * Daytime window for periodic notifications (in IST / local server time).
   * Default: 10am to 10pm (22:00).
   */
  dayStartHour: toInt(process.env.NOTIFICATION_DAY_START_HOUR, 10),
  dayEndHour: toInt(process.env.NOTIFICATION_DAY_END_HOUR, 22),

  /** Minimum hours between two periodic notifications for the same user */
  minIntervalHours: toInt(process.env.NOTIFICATION_MIN_INTERVAL_HOURS, 2),

  /** Maximum periodic notifications a user can receive per day */
  maxDailyCount: toInt(process.env.NOTIFICATION_MAX_DAILY_COUNT, 4),

  /** How many times BullMQ should retry a failed notification job */
  retryAttempts: toInt(process.env.NOTIFICATION_RETRY_ATTEMPTS, 3),

  /** Base retry delay in ms for exponential backoff (5s → 10s → 20s) */
  retryBaseDelayMs: 5000,

  /** IANA timezone used for daytime window calculations */
  timezone: process.env.NOTIFICATION_TIMEZONE || "Asia/Kolkata",
} as const;

export type NotifConfig = typeof notifConfig;
