import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "../config/s3";
import { connectDB } from "../config/db";
import mongoose from "mongoose";

const testS3 = async () => {
  try {
    console.log("Testing S3 connection...");
    console.log("Bucket:", S3_BUCKET_NAME);
    
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
    });

    const response = await s3Client.send(command);
    console.log("S3 Connection Successful!");
    console.log("Files found:", response.Contents?.length || 0);
    if (response.Contents) {
      console.log("First 5 files:");
      response.Contents.slice(0, 5).forEach(f => console.log(` - ${f.Key} (${f.Size} bytes)`));
    }
  } catch (error) {
    console.error("S3 Connection Failed:");
    console.error(error);
  }
};

const run = async () => {
  await connectDB();
  await testS3();
  await mongoose.connection.close();
};

run();
