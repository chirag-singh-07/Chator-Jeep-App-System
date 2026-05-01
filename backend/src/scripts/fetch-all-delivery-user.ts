import dotenv from "dotenv";
import path from "path";
// Load env before other imports that use env
dotenv.config({ path: path.join(__dirname, "../../.env") });

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";
import { ROLES } from "../common/constants";

// Fetch all delivery users from the database
const run = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log(`Fetching users with role: ${ROLES.DELIVERY}...`);
    const users = await User.find({ role: ROLES.DELIVERY }).lean();

    if (users.length === 0) {
      console.log("No delivery partners found in the database.");
    } else {
      console.log(`Found ${users.length} delivery partners:`);
      users.forEach((user, index) => {
        console.log(
          `${index + 1}. Name: ${user.name} | Email: ${user.email} | Phone: ${user.phone || "N/A"}`,
        );
      });
    }

    await mongoose.disconnect();
    console.log("Disconnected from database. Done.");
    process.exit(0);
  } catch (error) {
    console.error("Error executing script:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
