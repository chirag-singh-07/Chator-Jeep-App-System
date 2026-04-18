import { AppError } from "../../common/errors/app-error";
import { findUserById } from "./user.repository";

export const getMyProfile = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};
