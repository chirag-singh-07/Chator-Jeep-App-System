const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const DeliveryPartner = mongoose.connection.collection('deliverypartners');
    const partners = await DeliveryPartner.find({}).sort({createdAt: -1}).limit(5).toArray();
    console.log("Recent Delivery Partners:", JSON.stringify(partners.map(p => ({
      _id: p._id,
      fullName: p.fullName,
      phoneNumber: p.phoneNumber,
      createdAt: p.createdAt,
      documents: p.documents,
      userId: p.userId
    })), null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
run();
