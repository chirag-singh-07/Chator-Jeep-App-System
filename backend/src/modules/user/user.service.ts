import { AppError } from "../../common/errors/app-error";
import { findUserById, listUsers } from "./user.repository";
import { Role } from "../../common/constants";

export const getMyProfile = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

// ─── Admin Services ──────────────────────────────────────────────────────────

export const adminListUsers = async (query: {
  role?: Role;
  page?: string;
  limit?: string;
  search?: string;
}) => {
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "20");
  
  const { users, total } = await listUsers(query.role, page, limit, query.search);
  
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
