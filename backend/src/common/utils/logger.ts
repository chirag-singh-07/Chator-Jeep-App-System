import fs from "fs";
import path from "path";

const LOGS_DIR = path.join(__dirname, "../../../../logs");

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const SYSTEM_LOG = path.join(LOGS_DIR, "system.log");
const CRON_LOG = path.join(LOGS_DIR, "cron.log");

const writeLog = (filePath: string, level: string, message: string) => {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}\n`;

  // Also log to console
  if (level === "ERROR") {
    console.error(logLine.trim());
  } else {
    console.log(logLine.trim());
  }

  // Append to file
  fs.appendFile(filePath, logLine, (err) => {
    if (err) console.error("Failed to write to log file", err);
  });
};

export const logger = {
  info: (message: string) => writeLog(SYSTEM_LOG, "INFO", message),
  error: (message: string, error: unknown) =>
    writeLog(SYSTEM_LOG, "ERROR", message),
  warn: (message: string) => writeLog(SYSTEM_LOG, "WARN", message),

  cron: {
    info: (message: string) => writeLog(CRON_LOG, "INFO", message),
    error: (message: string) => writeLog(CRON_LOG, "ERROR", message),
  },
};

export const getLogs = (
  type: "system" | "cron",
  lines: number = 100,
): string[] => {
  const filePath = type === "system" ? SYSTEM_LOG : CRON_LOG;
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf-8");
  const logLines = content.split("\n").filter((line) => line.trim() !== "");

  // Return last N lines
  return logLines.slice(-lines);
};
