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

  const subject = type === "register" ? "Verify your Account - Chatori Jeep" : "Security Code - Chatori Jeep";
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: -1px;">Chatori Jeep</h1>
        <p style="color: #666; margin: 4px 0 0 0; font-size: 14px;">Partner Delivery Console</p>
      </div>
      
      <div style="padding: 24px; background-color: #fafafa; border-radius: 8px; text-align: center;">
        <p style="color: #333; font-size: 16px; margin-bottom: 16px;">Your verification code for <strong>${type.replace("_", " ")}</strong> is:</p>
        <div style="font-size: 42px; font-weight: 900; color: #000; letter-spacing: 8px; margin: 20px 0;">${otpCode}</div>
        <p style="color: #888; font-size: 13px;">This code will expire in <strong>10 minutes</strong>. Please do not share it with anyone.</p>
      </div>
      
      <div style="margin-top: 24px; text-align: center; color: #999; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Chatori Jeep Fleet System. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `Your Chatori Jeep OTP for ${type.replace("_", " ")} is: ${otpCode}. It expires in 10 minutes.`;
  
  await sendEmail(normalizedEmail, subject, text, html);
  
  return { success: true, message: "OTP sent successfully" };
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
