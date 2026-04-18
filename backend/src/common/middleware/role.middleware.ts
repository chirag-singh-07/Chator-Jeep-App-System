import { NextFunction, Response } from "express";
import { Role } from "../constants";
import { AppError } from "../errors/app-error";
import { AuthenticatedRequest } from "./auth.middleware";

export const roleMiddleware = (allowedRoles: Role[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new AppError("Forbidden", 403);
    }

    next();
  };
