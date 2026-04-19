import { AppError } from "../../common/errors/app-error";
import { findUserById, listUsers, createUser, findUserByEmail } from "./user.repository";
import { Role, ROLES } from "../../common/constants";
import { hashPassword } from "../../common/utils/hash";

export const getMyProfile = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

// ─── Admin Services ──────────────────────────────────────────────────────────

export const adminListUsers = async (query: {
  role?: string;
  page?: string;
  limit?: string;
  search?: string;
}) => {
  const role = query.role;
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "20");
  
  const { users, total } = await listUsers(role, page, limit, query.search);
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const adminGetUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const adminCreateUser = async (payload: any, role: Role) => {
  const { name, email, password, phone } = payload;
  
  if (!password || password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await hashPassword(password);
  
  const user = await createUser({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone,
    role,
    status: "ACTIVE"
  });

  return user;
};
