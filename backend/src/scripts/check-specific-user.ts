import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";

const run = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email: "contactgrowthnation@gmail.com" });
    if (user) {
      console.log("User found:");
      console.log(`ID: ${user._id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
    } else {
      console.log("User not found.");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
