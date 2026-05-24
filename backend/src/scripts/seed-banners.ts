import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { BannerModel } from '../modules/banner/banner.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/chator-jeep';

const bannersToSeed = [
  {
    title: "50% Off on Pizza",
    subtitle: "Valid on all large pizzas today",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000",
    linkType: "OFFER",
    linkId: "OFFER_PIZZA_50",
    isActive: true,
    priority: 10,
  },
  {
    title: "Healthy Salads",
    subtitle: "Stay fit with our new organic range",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "healthy-salads",
    isActive: true,
    priority: 8,
  },
  {
    title: "Burger Bonanza",
    subtitle: "Buy 1 Get 1 Free on all burgers",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000",
    linkType: "OFFER",
    linkId: "BOGO_BURGER",
    isActive: true,
    priority: 9,
  },
  {
    title: "Sushi Special",
    subtitle: "Authentic Japanese delicacies",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "sushi",
    isActive: true,
    priority: 7,
  },
  {
    title: "Weekend Desserts",
    subtitle: "Satisfy your sweet tooth",
    imageUrl: "https://images.unsplash.com/photo-1551024506-0cbce5d30bc7?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "desserts",
    isActive: true,
    priority: 6,
  },

  // New Banners

  {
    title: "Spicy Indian Feast",
    subtitle: "Enjoy authentic spicy curries & naan",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "indian-food",
    isActive: true,
    priority: 9,
  },
  {
    title: "Pasta Paradise",
    subtitle: "Creamy Alfredo & cheesy pasta combos",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "pasta",
    isActive: true,
    priority: 7,
  },
  {
    title: "Midnight Cravings",
    subtitle: "Late-night snacks delivered fast",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
    linkType: "OFFER",
    linkId: "MIDNIGHT_SNACKS",
    isActive: true,
    priority: 8,
  },
  {
    title: "Fresh Juice Bar",
    subtitle: "Cold pressed juices & smoothies",
    imageUrl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "juices",
    isActive: true,
    priority: 5,
  },
  {
    title: "Chicken Bucket Deal",
    subtitle: "Crispy chicken bucket for the whole family",
    imageUrl: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=1000",
    linkType: "OFFER",
    linkId: "CHICKEN_BUCKET",
    isActive: true,
    priority: 10,
  },
  {
    title: "Breakfast Specials",
    subtitle: "Start your day with tasty combos",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "breakfast",
    isActive: true,
    priority: 6,
  },
  {
    title: "Ice Cream Fiesta",
    subtitle: "Cool down with premium ice creams",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "ice-cream",
    isActive: true,
    priority: 5,
  },
  {
    title: "Chinese Combo Meals",
    subtitle: "Noodles, Manchurian & fried rice",
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "chinese",
    isActive: true,
    priority: 8,
  },
  {
    title: "Free Delivery Weekend",
    subtitle: "No delivery charges on all orders",
    imageUrl: "https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=1000",
    linkType: "OFFER",
    linkId: "FREE_DELIVERY",
    isActive: true,
    priority: 10,
  },
  {
    title: "Coffee Lovers",
    subtitle: "Freshly brewed coffee at amazing prices",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000",
    linkType: "CATEGORY",
    linkId: "coffee",
    isActive: true,
    priority: 7,
  },
];

async function seedBanners() {
  try {
    console.log('Connecting to database...', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing existing banners...');
    await BannerModel.deleteMany({});

    console.log('Inserting new banners...');
    await BannerModel.insertMany(bannersToSeed);

    console.log(`Successfully seeded ${bannersToSeed.length} banners!`);
  } catch (error) {
    console.error('Error seeding banners:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  }
}

seedBanners();
