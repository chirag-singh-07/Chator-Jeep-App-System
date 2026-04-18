import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as authService from "./auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.register(req.body);
  res.status(201).json(tokens);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.login(req.body);
  res.status(200).json(tokens);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.status(200).json(tokens);
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await authService.logout(req.user!.userId);
  res.status(204).send();
});
