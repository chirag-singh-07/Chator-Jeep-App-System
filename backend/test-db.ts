import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    
    // Check DeliveryPartner
    const DeliveryPartner = mongoose.connection.collection('deliverypartners');
    const partners = await DeliveryPartner.find({}).sort({createdAt: -1}).limit(2).toArray();
    console.log("Delivery Partners:", JSON.stringify(partners, null, 2));

    // Check Restaurant
    const Restaurant = mongoose.connection.collection('restaurants');
    const restaurants = await Restaurant.find({}).sort({createdAt: -1}).limit(2).toArray();
    console.log("Restaurants:", JSON.stringify(restaurants, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
run();
