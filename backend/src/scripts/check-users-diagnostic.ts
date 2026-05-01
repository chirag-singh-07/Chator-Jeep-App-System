import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";

const run = async () => {
  try {
    await connectDB();
    const count = await User.countDocuments();
    console.log(`Total users in database: ${count}`);

    const roles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    console.log("Roles breakdown:", roles);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
