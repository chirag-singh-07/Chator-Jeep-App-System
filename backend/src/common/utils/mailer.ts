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
      from: 'Chatori Jeeb <noreply@chatorijeeb.com>',
      to: [to],
      subject: subject,
      text: text,
      html: html || text,
    });

    if (error) {
      logger.error(`[RESEND ERROR] Code: ${(error as any).statusCode} | Name: ${(error as any).name} | Message: ${error.message}`, error);
      logger.error(`[RESEND FULL ERROR]`, JSON.stringify(error, null, 2));
      throw error;
    }

    logger.info(`[EMAIL SENT] ✅ Resend ID: ${data?.id} | To: ${to} | Subject: ${subject}`);
    return true;
  } catch (error: any) {
    logger.error(`[EMAIL FAILED] ❌ To: ${to} | Subject: ${subject}`, error);

    logger.error(`[EMAIL ERROR DETAIL]`, {
      message: error?.message,
      name: error?.name,
      statusCode: error?.statusCode,
      raw: JSON.stringify(error),
    });

    if (process.env.NODE_ENV === 'production') {
      throw error; // Let otp.service handle it and return proper error to user
    }
    
    logger.warn(`[EMAIL BYPASS] Continuing in ${process.env.NODE_ENV} mode despite email failure.`);
    return false; // Return false in dev so caller can decide what to do
  }
};
