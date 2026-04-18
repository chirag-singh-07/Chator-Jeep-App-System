export const ROLES = {
  USER: "USER",
  KITCHEN: "KITCHEN",
  DELIVERY: "DELIVERY",
  ADMIN: "ADMIN"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
