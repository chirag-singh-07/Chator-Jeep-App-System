import { IUser, User } from "../user/user.model";

export const findUserByEmail = (email: string): Promise<IUser | null> =>
  User.findOne({ email }).select("+password").exec();

export const createUser = (payload: Partial<IUser>): Promise<IUser> => User.create(payload);

export const findUserById = (userId: string): Promise<IUser | null> => User.findById(userId).exec();

export const updateRefreshToken = (userId: string, refreshToken: string | null): Promise<IUser | null> =>
  User.findByIdAndUpdate(userId, { $set: { refreshToken } }, { new: true }).exec();
