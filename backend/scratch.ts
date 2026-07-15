import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { adminGetUser } from "./src/modules/user/user.service";
import "./src/modules/user/user.model";
import "./src/modules/delivery/delivery.model";
import "./src/modules/restaurant/restaurant.model";

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  try {
    const user = await adminGetUser("6a48c50918531b22b864a544");
    const json = JSON.parse(JSON.stringify(user));
    console.log("partnerProfile keys:", Object.keys(json.partnerProfile || {}));
    console.log("Documents inside json:", json.partnerProfile?.documents);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});
