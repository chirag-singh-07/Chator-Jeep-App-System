import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("MONGODB_URI is not defined");
}

async function test() {
  try {
    console.log("Testing simple connection string...");
    await mongoose.connect(MONGO_URI!);
    console.log("Connected successfully!");
    await mongoose.disconnect();
  } catch (e) {
    console.error("Simple connection failed:", e);
  }
}

test();
