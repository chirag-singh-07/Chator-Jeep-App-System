import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    const dbName = mongoose.connection.name || "unknown";
    const host = mongoose.connection.host || "unknown";
    console.log(`MongoDB connected: ${host}/${dbName}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // or implement retry logic
  }
};