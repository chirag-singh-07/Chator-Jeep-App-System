import mongoose from "mongoose";
import { hashPassword } from "../common/utils/hash";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";
import { ROLES } from "../common/constants";

const ADMIN_EMAIL = "admin@gmail.com";
const NEW_PASSWORD = "Lucky7600";

const run = async (): Promise<void> => {
  console.log("Connecting to database...");
  await connectDB();

  console.log(`Hashing new password for ${ADMIN_EMAIL}...`);
  const hashedPassword = await hashPassword(NEW_PASSWORD);

  console.log("Searching for admin user...");
  const admin = await User.findOne({ email: ADMIN_EMAIL });

  if (admin) {
    admin.password = hashedPassword;
    // Ensure role is ADMIN just in case
    admin.role = ROLES.ADMIN;
    await admin.save();
    console.log(`Successfully updated password for admin: ${ADMIN_EMAIL}`);
  } else {
    console.log(`Admin user ${ADMIN_EMAIL} not found. Creating new admin...`);
    await User.create({
      name: "Chatori Jeeb Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: ROLES.ADMIN,
      addresses: [],
      phone: "9876543210"
    });
    console.log(`Successfully created admin user: ${ADMIN_EMAIL}`);
  }
};

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error updating admin password: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  });
