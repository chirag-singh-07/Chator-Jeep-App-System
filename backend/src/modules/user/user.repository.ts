import { IUser, User } from "./user.model";
import { Role } from "../../common/constants";

// ─── Lookups ───────────────────────────────────────────────────────────────────
export const findUserById = (userId: string): Promise<IUser | null> =>
  User.findById(userId).exec();

export const findUserByEmail = (email: string): Promise<IUser | null> =>
  User.findOne({ email }).exec();

// ─── Admin Listing (paginated + filtered) ───────────────────────────────────
export const listUsers = async (
  role?: Role,
  page = 1,
  limit = 20,
  search?: string
): Promise<{ users: IUser[]; total: number }> => {
  const filter: Record<string, unknown> = {};
  if (role) filter["role"] = role;
  if (search) {
    filter["$or"] = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    User.countDocuments(filter).exec(),
  ]);

  return { users, total };
};

// ─── Admin Actions ──────────────────────────────────────────────────────────
export const updateUserStatus = (
  userId: string,
  role: Role,
  status: string // We don't have a status field yet, but we might want one (e.g., Active/Suspended)
): Promise<IUser | null> =>
  User.findByIdAndUpdate(userId, { role }, { new: true }).exec();

// ─── Creation (for auth) ────────────────────────────────────────────────────
export const createUser = (payload: Partial<IUser>): Promise<IUser> =>
  User.create(payload);
