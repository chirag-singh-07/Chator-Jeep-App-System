import mongoose from "mongoose";
import { ROLES } from "../common/constants";
import { connectDB } from "../config/db";
import { User } from "../modules/auth/auth.model";

const run = async (): Promise<void> => {
  const oldEmail = (process.env.OLD_ADMIN_EMAIL ?? "admin@gamil.com").trim().toLowerCase();
  const newEmail = (process.env.NEW_ADMIN_EMAIL ?? "admin@gmail.com").trim().toLowerCase();

  if (oldEmail === newEmail) {
    throw new Error("OLD_ADMIN_EMAIL and NEW_ADMIN_EMAIL cannot be the same.");
  }

  await connectDB();

  const existingNew = await User.findOne({ email: newEmail }).exec();
  if (existingNew) {
    console.log(`Target email already exists: ${newEmail}`);
    console.log("No changes made.");
    return;
  }

  const oldAdmin = await User.findOne({ email: oldEmail }).exec();
  if (!oldAdmin) {
    console.log(`Source admin not found: ${oldEmail}`);
    console.log("No changes made.");
    return;
  }

  oldAdmin.email = newEmail;
  oldAdmin.role = ROLES.ADMIN;
  await oldAdmin.save();

  console.log(`Admin email updated: ${oldEmail} -> ${newEmail}`);
};

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to rename admin email: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
