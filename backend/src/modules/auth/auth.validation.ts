import { z } from "zod";

const indianPhoneRegex = /^[6-9]\d{9}$/;

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().trim().regex(indianPhoneRegex, "Please enter a valid Indian mobile number").optional(),
    otp: z.string().optional(),
    role: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10)
  })
});
