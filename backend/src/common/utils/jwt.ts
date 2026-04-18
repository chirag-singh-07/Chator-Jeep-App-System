import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { Role } from "../constants";

export type AuthPayload = {
  userId: string;
  role: Role;
};

const toSignOptions = (expiresIn: string): SignOptions => ({
  expiresIn: expiresIn as SignOptions["expiresIn"]
});

export const signAccessToken = (payload: AuthPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, toSignOptions(env.JWT_ACCESS_EXPIRES_IN));

export const signRefreshToken = (payload: AuthPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, toSignOptions(env.JWT_REFRESH_EXPIRES_IN));

export const verifyAccessToken = (token: string): AuthPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;

export const verifyRefreshToken = (token: string): AuthPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthPayload;
