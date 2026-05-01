import { Resend } from "resend";
import { logger } from "./logger";

// Initialize Resend with API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Chatori Jeep <onboarding@resend.dev>', // You should update this to your verified domain in production
      to: [to],
      subject: subject,
      text: text,
      html: html || text,
    });

    if (error) {
      throw error;
    }

    logger.info(`[EMAIL SENT] Resend ID: ${data?.id} | To: ${to}`);
    return true;
  } catch (error) {
    logger.error(`[EMAIL ERROR] Failed to send email via Resend to ${to}:`, error);

    // Fallback to simulator in dev if no Resend API Key
    if (!process.env.RESEND_API_KEY) {
      logger.warn(`[EMAIL SIMULATOR FALLBACK] To: ${to} | Subject: ${subject}`);
      logger.info(`[EMAIL CONTENT] ${text}`);
      return true;
    }

    throw error;
  }
};
