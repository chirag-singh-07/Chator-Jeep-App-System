import mongoose from "mongoose";
import { comparePassword } from "../common/utils/hash";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";

const run = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email) {
    throw new Error("Missing ADMIN_EMAIL in environment.");
  }

  await connectDB();

  const user = await User.findOne({ email }).exec();
  if (!user) {
    console.log(`Admin/user not found for email: ${email}`);
    return;
  }

  console.log(`User found: ${email}`);
  console.log(`Role: ${user.role}`);
  console.log(`Has password hash: ${Boolean(user.password)}`);

  if (password) {
    const match = await comparePassword(password, user.password);
    console.log(`Password matches: ${match}`);
  } else {
    console.log("Password check skipped (set ADMIN_PASSWORD to verify match).");
  }
};

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to verify admin: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
