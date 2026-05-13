import { AppError } from "../../common/errors/app-error";
import { generateOTP } from "../../common/utils/otp.util";
import { sendEmail } from "../../common/utils/mailer";
import { Otp } from "./otp.model";

export const sendOtp = async (email: string, type: "register" | "forgot_password" | "login") => {
  const normalizedEmail = email.trim().toLowerCase();
  const otpCode = generateOTP(6);
  
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  await Otp.deleteMany({ email: normalizedEmail, type });
  
  await Otp.create({
    email: normalizedEmail,
    otp: otpCode,
    type,
    expiresAt,
  });

  const subject = type === "register" ? "Verify your Account - Chatori Jeeb" : "Security Code - Chatori Jeeb";
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: -1px;">Chatori Jeeb</h1>
        <p style="color: #666; margin: 4px 0 0 0; font-size: 14px;">Partner Delivery Console</p>
      </div>
      
      <div style="padding: 24px; background-color: #fafafa; border-radius: 8px; text-align: center;">
        <p style="color: #333; font-size: 16px; margin-bottom: 16px;">Your verification code for <strong>${type.replace("_", " ")}</strong> is:</p>
        <div style="font-size: 42px; font-weight: 900; color: #000; letter-spacing: 8px; margin: 20px 0;">${otpCode}</div>
        <p style="color: #888; font-size: 13px;">This code will expire in <strong>10 minutes</strong>. Please do not share it with anyone.</p>
      </div>
      
      <div style="margin-top: 24px; text-align: center; color: #999; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Chatori Jeeb Fleet System. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `Your Chatori Jeeb OTP for ${type.replace("_", " ")} is: ${otpCode}. It expires in 10 minutes.`;
  
  let emailSent = false;
  let emailError: any = null;

  try {
    await sendEmail(normalizedEmail, subject, text, html);
    emailSent = true;
  } catch (err: any) {
    emailError = err;
    console.error(`[OTP SERVICE] ❌ Failed to send email to ${normalizedEmail}:`, {
      message: err?.message,
      name: err?.name,
      statusCode: err?.statusCode,
      details: JSON.stringify(err),
    });
  }

  // In production: if email failed, surface the error so the user knows
  if (!emailSent && process.env.NODE_ENV === 'production') {
    throw new AppError(
      `Email sending failed. Please try again or contact support. (${emailError?.message || 'Resend error'})`,
      503
    );
  }

  return { 
    success: true, 
    message: emailSent ? "OTP sent successfully" : "OTP generated (email failed in dev mode)",
    // Always return OTP in non-production so testing is never blocked
    ...(process.env.NODE_ENV !== 'production' && { otp: otpCode }),
    // Return OTP even in prod if email failed (only for dev debugging — remove before real launch)
    ...(!emailSent && { otp: otpCode, emailFailed: true }),
  };
};

export const verifyOtp = async (email: string, otp: string, type: "register" | "forgot_password" | "login") => {
  const normalizedEmail = email.trim().toLowerCase();
  const record = await Otp.findOne({ email: normalizedEmail, otp, type });
  
  if (!record) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await Otp.deleteOne({ _id: record._id });
  return true;
};
