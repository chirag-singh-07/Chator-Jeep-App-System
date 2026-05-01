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
    console.log("Connected to MongoDB!");

    const admin = mongoose.connection.db!.admin();
    const dbs = await admin.listDatabases();
    console.log("Databases on this cluster:");
    console.log(dbs.databases.map((db: any) => db.name));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
