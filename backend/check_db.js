const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const MenuItem = mongoose.connection.collection('menuitems');
  const items = await MenuItem.find({ name: "Pqnner" }).toArray();
  console.log(items);
  
  mongoose.disconnect();
}
check();
