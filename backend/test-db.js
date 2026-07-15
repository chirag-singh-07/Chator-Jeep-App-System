
const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const User = mongoose.connection.collection('users');
    const user = await User.findOne({ email: "krishnaayvid01@gmail.com" });
    console.log("User:", user);
    
    const DeliveryPartner = mongoose.connection.collection('deliverypartners');
    const partner = await DeliveryPartner.findOne({ email: "krishnaayvid01@gmail.com" });
    console.log("Delivery Partner:", partner);

    const Restaurant = mongoose.connection.collection('restaurants');
    const restaurant = await Restaurant.findOne({ email: "krishnaayvid01@gmail.com" });
    console.log("Restaurant:", restaurant);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
run();
