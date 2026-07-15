require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  require("./src/modules/user/user.model");
  require("./src/modules/delivery/delivery.model");
  require("./src/modules/restaurant/restaurant.model");
  
  const { adminGetUser } = require("./src/modules/user/user.service");
  
  const user = await adminGetUser("6a48c50918531b22b864a544");
  console.log("Documents:", user.partnerProfile ? user.partnerProfile.documents : "No profile");
  process.exit(0);
}).catch(console.error);
