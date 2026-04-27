import { AppError } from "../../common/errors/app-error";
import { generateOTP } from "../../common/utils/otp.util";
import { sendEmail } from "../../common/utils/mailer";
import { Otp } from "./otp.model";

export const sendOtp = async (email: string, type: "register" | "forgot_password" | "login") => {
  const normalizedEmail = email.trim().toLowerCase();
  const otpCode = generateOTP(6); // Using 6 digits for production feel
  
  // Save OTP to DB (valid for 10 minutes)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  // Delete existing OTPs for this email and type to prevent spam/conflicts
  await Otp.deleteMany({ email: normalizedEmail, type });
  
  await Otp.create({
    email: normalizedEmail,
    otp: otpCode,
    type,
    expiresAt,
  });

  // Send Email
  const subject = type === "register" ? "Verify your Account" : "Reset your Password";
  const text = `Your OTP for ${type.replace("_", " ")} is: ${otpCode}. It expires in 10 minutes.`;
  
  await sendEmail(normalizedEmail, subject, text);
  
  return { success: true, message: "OTP sent successfully" };
};

export const verifyOtp = async (email: string, otp: string, type: "register" | "forgot_password" | "login") => {
  const normalizedEmail = email.trim().toLowerCase();
  
  const record = await Otp.findOne({ email: normalizedEmail, otp, type });
  
  if (!record) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  // OTP verified, delete it
  await Otp.deleteOne({ _id: record._id });
  
  return true;
};
