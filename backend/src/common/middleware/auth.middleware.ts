import { NextFunction, Request, Response } from "express";
import { Role } from "../constants";
import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../utils/jwt";

export type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: Role;
  };
};

export const authMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);
  req.user = payload;

  next();
};
