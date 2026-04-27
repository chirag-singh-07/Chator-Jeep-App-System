import { logger } from "./logger";

export const sendEmail = async (to: string, subject: string, text: string) => {
  // In a real app, integrate with SendGrid, SES, or Nodemailer
  // For now, we'll log it and simulate success
  logger.info(`[EMAIL SIMULATOR] To: ${to} | Subject: ${subject}`);
  logger.info(`[EMAIL CONTENT] ${text}`);
  
  return true;
};
