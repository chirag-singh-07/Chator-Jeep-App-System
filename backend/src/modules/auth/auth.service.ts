import { AppError } from "../../common/errors/app-error";
import { comparePassword, hashPassword } from "../../common/utils/hash";
import {
  AuthPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../../common/utils/jwt";
import { createUser, findUserByEmail, findUserById, updateRefreshToken } from "./auth.repository";

const buildTokenResponse = (payload: AuthPayload) => {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
};

import * as otpService from "./otp.service";

export const register = async (input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  otp: string;
}) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  
  // Verify OTP first
  await otpService.verifyOtp(normalizedEmail, input.otp, "register");

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const password = await hashPassword(input.password);
  const user = await createUser({
    name: input.name,
    email: normalizedEmail,
    password,
    phone: input.phone
  });

  const payload = { userId: user._id.toString(), role: user.role };
  const tokens = buildTokenResponse(payload);
  await updateRefreshToken(user._id.toString(), tokens.refreshToken);

  return { 
    ...tokens, 
    user: { 
      id: user._id.toString(), 
      name: user.name, 
      email: user.email, 
      role: user.role 
    } 
  };
};

export const login = async (input: {
  email: string;
  password: string;
}) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  const payload = { userId: user._id.toString(), role: user.role };
  const tokens = buildTokenResponse(payload);
  await updateRefreshToken(user._id.toString(), tokens.refreshToken);

  return { 
    ...tokens, 
    user: { 
      id: user._id.toString(), 
      name: user.name, 
      email: user.email, 
      role: user.role 
    } 
  };
};

export const loginWithOtp = async (input: {
  email: string;
  otp: string;
}) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  
  // Verify OTP
  await otpService.verifyOtp(normalizedEmail, input.otp, "login");

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError("User not found. Please register first.", 404);
  }

  const payload = { userId: user._id.toString(), role: user.role };
  const tokens = buildTokenResponse(payload);
  await updateRefreshToken(user._id.toString(), tokens.refreshToken);

  return { 
    ...tokens, 
    user: { 
      id: user._id.toString(), 
      name: user.name, 
      email: user.email, 
      role: user.role 
    } 
  };
};

export const refresh = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await findUserById(payload.userId);

  if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  const nextTokens = buildTokenResponse({ userId: user._id.toString(), role: user.role });
  await updateRefreshToken(user._id.toString(), nextTokens.refreshToken);

  return nextTokens;
};

export const logout = async (userId: string): Promise<void> => {
  await updateRefreshToken(userId, null);
};

export const resetPassword = async (input: {
  email: string;
  otp: string;
  password: string;
}) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  
  // Verify OTP
  await otpService.verifyOtp(normalizedEmail, input.otp, "forgot_password");
  
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  const hashedPassword = await hashPassword(input.password);
  user.password = hashedPassword;
  await user.save();
  
  return { success: true, message: "Password reset successful" };
};
