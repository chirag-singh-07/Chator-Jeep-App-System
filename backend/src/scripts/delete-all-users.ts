/**
 * Deletes ALL users from the database EXCEPT the admin with email admin@gmail.com.
 *
 * Usage:  npx ts-node src/scripts/delete-all-users.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

import { User } from "../modules/user/user.model";

const ADMIN_EMAIL = "admin@gmail.com";

const run = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  // Count before
  const totalBefore = await User.countDocuments();
  const adminUser = await User.findOne({ email: ADMIN_EMAIL });

  if (!adminUser) {
    console.warn(`⚠️  No admin user found with email "${ADMIN_EMAIL}". Aborting to be safe.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Found admin: ${adminUser.name} (${adminUser.email}) — this user will be KEPT.`);
  console.log(`Total users before deletion: ${totalBefore}`);

  // Delete everyone except the admin
  const result = await User.deleteMany({ email: { $ne: ADMIN_EMAIL } });

  console.log(`✅ Deleted ${result.deletedCount} user(s).`);
  console.log(`Remaining users: ${await User.countDocuments()}`);

  await mongoose.disconnect();
  console.log("Disconnected. Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
