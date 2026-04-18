import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import { getMyProfile } from "./user.service";

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await getMyProfile(req.user!.userId);
  res.status(200).json(user);
});
