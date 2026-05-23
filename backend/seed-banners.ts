import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { BannerModel } from "./src/modules/banner/banner.model";

dotenv.config({ path: path.join(__dirname, ".env") });

const banners = [
  {
    title: "50% OFF on First Order",
    subtitle: "Use code WELCOME50",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
    linkType: "OFFER",
    isActive: true,
    priority: 100,
  },
  {
    title: "Weekend Pizza Party",
    subtitle: "Buy 1 Get 1 Free on all Medium Pizzas",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
    linkType: "CATEGORY",
    isActive: true,
    priority: 90,
  },
  {
    title: "Healthy Salads",
    subtitle: "Fresh and organic ingredients",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
    linkType: "CATEGORY",
    isActive: true,
    priority: 80,
  }
];

const seedBanners = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/food_order_system";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    await BannerModel.deleteMany({});
    console.log("Cleared existing banners.");

    await BannerModel.insertMany(banners);
    console.log("Successfully seeded", banners.length, "banners.");

    mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedBanners();
