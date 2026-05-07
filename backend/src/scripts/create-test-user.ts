import mongoose from "mongoose";
import { ROLES } from "../common/constants";
import { hashPassword } from "../common/utils/hash";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";
import dotenv from "dotenv";

dotenv.config();

const config = {
  name: "Test User",
  email: "testuser@example.com",
  password: "password123",
  phone: "9876543210"
};

const run = async (): Promise<void> => {
  await connectDB();

  const hashedPassword = await hashPassword(config.password);
  const existingUser = await User.findOne({ email: config.email }).exec();

  if (existingUser) {
    existingUser.name = config.name;
    existingUser.phone = config.phone;
    existingUser.password = hashedPassword;
    existingUser.role = ROLES.USER;
    await existingUser.save();

    console.log(`Test user updated: ${config.email}`);
  } else {
    await User.create({
      name: config.name,
      email: config.email,
      password: hashedPassword,
      phone: config.phone,
      role: ROLES.USER,
      addresses: []
    });

    console.log(`Test user created: ${config.email}`);
  }
  
  console.log('--------------------------');
  console.log('Login Credentials:');
  console.log(`Email: ${config.email}`);
  console.log(`Password: ${config.password}`);
  console.log('--------------------------');
};

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to create test user: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
