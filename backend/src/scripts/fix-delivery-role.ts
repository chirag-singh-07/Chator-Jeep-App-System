import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";
import { DeliveryPartner } from "../modules/delivery/delivery.model";
import { ROLES } from "../common/constants";

const run = async () => {
  try {
    await connectDB();
    const email = "contactgrowthnation@gmail.com";
    
    console.log(`Checking status for ${email}...`);
    
    const user = await User.findOne({ email });
    const partner = await DeliveryPartner.findOne({ email });

    if (!user) {
      console.log("❌ User not found in database.");
    } else {
      console.log(`✅ User found. Current Role: ${user.role}`);
    }

    if (!partner) {
      console.log("❌ DeliveryPartner profile not found.");
    } else {
      console.log(`✅ DeliveryPartner profile found. Status: ${partner.status}`);
      if (user && user.role !== ROLES.DELIVERY) {
        console.log("⚠️ Role mismatch detected. Promoting user to DELIVERY...");
        user.role = ROLES.DELIVERY;
        await user.save();
        console.log("🚀 User successfully promoted to DELIVERY role!");
      } else if (user && user.role === ROLES.DELIVERY) {
        console.log("✨ User already has correct DELIVERY role.");
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
