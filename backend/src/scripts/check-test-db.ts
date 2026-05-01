import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

import mongoose from "mongoose";

const run = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI;
    if (!MONGO_URI) {
      throw new Error("MONGODB_URI is not defined");
    }
    await mongoose.connect(MONGO_URI);
    console.log("Connected to 'test' database!");

    const db = mongoose.connection.db!;
    const users = await db
      .collection("users")
      .countDocuments({ email: "contactgrowthnation@gmail.com" });
    const partners = await db
      .collection("deliverypartners")
      .countDocuments({ email: "contactgrowthnation@gmail.com" });

    console.log(`Users in 'test': ${users}`);
    console.log(`Partners in 'test': ${partners}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
