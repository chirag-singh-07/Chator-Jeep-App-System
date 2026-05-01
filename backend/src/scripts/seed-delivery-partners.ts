import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";
import { DeliveryPartner } from "../modules/delivery/delivery.model";
import { hashPassword } from "../common/utils/hash";
import { ROLES } from "../common/constants";

const SEED_PASSWORD = "password123";

const deliveryPartners = [
  {
    name: "John Doe",
    email: "john.delivery@example.com",
    phone: "9876543210",
    vehicleType: "Bike",
  },
  {
    name: "Jane Smith",
    email: "jane.delivery@example.com",
    phone: "9876543211",
    vehicleType: "Cycle",
  },
  {
    name: "Mike Ross",
    email: "mike.delivery@example.com",
    phone: "9876543212",
    vehicleType: "Car",
  },
];

const seed = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();

    const hashedPassword = await hashPassword(SEED_PASSWORD);

    for (const data of deliveryPartners) {
      console.log(`Seeding ${data.name}...`);

      // Check if user exists
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          role: ROLES.DELIVERY,
          status: "ACTIVE",
        });
      }

      // Check if partner profile exists
      let partner = await DeliveryPartner.findOne({ userId: user._id });
      if (!partner) {
        await DeliveryPartner.create({
          userId: user._id,
          fullName: data.name,
          phoneNumber: data.phone,
          email: data.email,
          vehicleType: data.vehicleType,
          status: "approved",
          isOnline: true,
          isAvailable: true,
          currentLocation: {
            type: "Point",
            coordinates: [77.1025, 28.7041], // Delhi coordinates
          },
          bankDetails: {
            accountHolderName: data.name,
            accountNumber: "1234567890",
            ifscCode: "HDFC0001234",
            bankName: "HDFC Bank",
          },
        });
      }
    }

    console.log("✅ Seeding completed successfully!");
    console.log(`🔑 All accounts use password: ${SEED_PASSWORD}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
