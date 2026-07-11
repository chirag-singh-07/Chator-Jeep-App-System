const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const User = mongoose.connection.collection('users');
    const DeliveryPartner = mongoose.connection.collection('deliverypartners');

    const partner = await DeliveryPartner.findOne({ userId: new mongoose.Types.ObjectId("6a48c50918531b22b864a544") });
    
    // Now simulate backend user.service.ts
    const user = await User.findOne({ _id: new mongoose.Types.ObjectId("6a48c50918531b22b864a544") });
    
    console.log("User:", JSON.stringify({ ...user, partnerProfile: partner }, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
run();
