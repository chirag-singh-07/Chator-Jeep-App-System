const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const Category = mongoose.connection.collection('categories');
  const cat = await Category.findOne({ _id: new mongoose.Types.ObjectId('69eb5954e2c4d53567ce3b15') });
  console.log("Category is:", cat ? cat.name : 'NOT FOUND');
  
  mongoose.disconnect();
}
check();
