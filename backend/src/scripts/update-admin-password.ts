import mongoose from "mongoose";
import { hashPassword } from "../common/utils/hash";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";
import { ROLES } from "../common/constants";

const run = async (): Promise<void> => {
  await connectDB();

  // Find the first admin user
  const admin = await User.findOne({ role: ROLES.ADMIN }).exec();
  if (!admin) {
    console.log("❌ No Admin user found in the database. Run 'npm run create:admin' first.");
    return;
  }

  console.log("--- Admin Details ---");
  console.log(`Name: ${admin.name}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Phone: ${admin.phone || "N/A"}`);
  console.log(`Status: ${admin.status}`);
  console.log("---------------------");

  // Use the password defined in the .env file
  const newPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!newPassword) {
    console.log("\n⚠️ To update the password, set ADMIN_PASSWORD in your .env file and run this script again.");
    return;
  }

  console.log(`\nUpdating password to the value set in ADMIN_PASSWORD inside your .env file...`);
  
  // Hash and save the new password
  admin.password = await hashPassword(newPassword);
  await admin.save();

  console.log("✅ Admin password updated successfully! You can now log into the admin panel.");
};

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to update admin: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
