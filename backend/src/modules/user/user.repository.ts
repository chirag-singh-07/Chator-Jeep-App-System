import { IUser, User } from "../auth/auth.model";

export const findUserById = (userId: string): Promise<IUser | null> =>
  User.findById(userId).select("-password -refreshToken").exec();
