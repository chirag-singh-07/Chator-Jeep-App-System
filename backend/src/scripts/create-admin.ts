import mongoose from "mongoose";
import { ROLES } from "../common/constants";
import { hashPassword } from "../common/utils/hash";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";

const readConfig = () => {
  const name = process.env.ADMIN_NAME?.trim() || "Chatori Jeep Admin";
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const phone = process.env.ADMIN_PHONE?.trim();

  if (!email || !password) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  return { name, email, password, phone };
};

const run = async (): Promise<void> => {
  const config = readConfig();
  await connectDB();

  const hashedPassword = await hashPassword(config.password);
  const existingUser = await User.findOne({ email: config.email }).exec();

  if (existingUser) {
    existingUser.name = config.name;
    existingUser.phone = config.phone ?? existingUser.phone;
    existingUser.password = hashedPassword;
    existingUser.role = ROLES.ADMIN;
    await existingUser.save();

    console.log(`Admin updated: ${config.email}`);
  } else {
    await User.create({
      name: config.name,
      email: config.email,
      password: hashedPassword,
      phone: config.phone,
      role: ROLES.ADMIN,
      addresses: []
    });

    console.log(`Admin created: ${config.email}`);
  }
};

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to create admin: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
