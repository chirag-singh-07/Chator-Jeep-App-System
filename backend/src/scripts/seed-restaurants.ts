import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { User } from "../modules/user/user.model";
import { Restaurant, RESTAURANT_STATUS, MenuItem } from "../modules/restaurant/restaurant.model";
import { ROLES } from "../common/constants/roles";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/food-order-system";

// ─── Add-ons Data ─────────────────────────────────────────────────────────────
const burgerAddOns = [
  { name: "Extra Cheese", price: 49, imageUrl: "https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=400&q=80" },
  { name: "Crispy Bacon", price: 99, imageUrl: "https://images.unsplash.com/photo-1606851094655-b2593a9af63f?w=400&q=80" },
  { name: "Caramelized Onions", price: 39, imageUrl: "https://images.unsplash.com/photo-1514472413502-875308246637?w=400&q=80" },
  { name: "Pickled Jalapeños", price: 29, imageUrl: "https://images.unsplash.com/photo-1590483736622-39da8af7541d?w=400&q=80" },
  { name: "Avocado Slices", price: 129, imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80" },
  { name: "Fried Egg", price: 59, imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80" },
  { name: "Sautéed Mushrooms", price: 69, imageUrl: "https://images.unsplash.com/photo-1534476478164-b15fec4f091c?w=400&q=80" },
  { name: "Spicy Mayo", price: 19, imageUrl: "https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=400&q=80" },
  { name: "Smoky BBQ Sauce", price: 19, imageUrl: "https://images.unsplash.com/photo-1621251911089-8d7698502d33?w=400&q=80" },
  { name: "Honey Mustard", price: 19, imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac3993cdf77?w=400&q=80" },
];

const pizzaAddOns = [
  { name: "Extra Mozzarella", price: 149, imageUrl: "https://images.unsplash.com/photo-1485962391905-dc37bb3ac4d4?w=400&q=80" },
  { name: "Spicy Pepperoni", price: 199, imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80" },
  { name: "Black Olives", price: 49, imageUrl: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&q=80" },
  { name: "Fresh Mushrooms", price: 79, imageUrl: "https://images.unsplash.com/photo-1503767849114-976b67568b02?w=400&q=80" },
  { name: "Diced Peppers", price: 59, imageUrl: "https://images.unsplash.com/photo-1566275529824-cca6d00a2507?w=400&q=80" },
  { name: "Fresh Pineapple", price: 89, imageUrl: "https://images.unsplash.com/photo-1550258114-b864e4c3ec3f?w=400&q=80" },
  { name: "Grilled Chicken", price: 249, imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80" },
  { name: "Garlic Dip", price: 29, imageUrl: "https://images.unsplash.com/photo-1571275220146-218f2195f0ae?w=400&q=80" },
  { name: "Ranch Dressing", price: 29, imageUrl: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=400&q=80" },
  { name: "Red Chili Flakes", price: 0, imageUrl: "https://images.unsplash.com/photo-1563203362-c38483a936a2?w=400&q=80" },
];

const sushiAddOns = [
  { name: "Extra Wasabi", price: 19, imageUrl: "https://images.unsplash.com/photo-1582234372722-50d7ccc30e5a?w=400&q=80" },
  { name: "Pickled Ginger", price: 29, imageUrl: "https://images.unsplash.com/photo-1562158074-9543be980b6b?w=400&q=80" },
  { name: "Spicy Mayo Drizzle", price: 39, imageUrl: "https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=400&q=80" },
  { name: "Unagi Sauce", price: 49, imageUrl: "https://images.unsplash.com/photo-1621251911089-8d7698502d33?w=400&q=80" },
  { name: "Tempura Crunch", price: 59, imageUrl: "https://images.unsplash.com/photo-1599321955419-7801382999d3?w=400&q=80" },
  { name: "Shredded Nori", price: 39, imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c170db76?w=400&q=80" },
  { name: "Fresh Avocado", price: 149, imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80" },
  { name: "Cucumber Strips", price: 49, imageUrl: "https://images.unsplash.com/photo-1449339044511-d14f89528c21?w=400&q=80" },
  { name: "Sriracha Hot Sauce", price: 19, imageUrl: "https://images.unsplash.com/photo-1590483736622-39da8af7541d?w=400&q=80" },
  { name: "Premium Soy Sauce", price: 0, imageUrl: "https://images.unsplash.com/photo-1615802107937-f13155106191?w=400&q=80" },
];

const restaurantsData = [
  {
    name: "The Burger King",
    email: "burgerking@gmail.com",
    phone: "9876543210",
    ownerName: "John Burger",
    ownerEmail: "owner.burger@gmail.com",
    cuisines: ["Burgers", "Fast Food"],
    address: { line1: "123 Burger St", city: "New York", state: "NY", pinCode: "10001" },
    location: { type: "Point", coordinates: [-73.935242, 40.730610] as [number, number] },
    addOns: burgerAddOns,
    menuItems: [
      { name: "Classic Whopper", price: 599, description: "Flame-grilled beef patty with fresh fixings", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80" },
      { name: "Double Whopper", price: 799, description: "Two flame-grilled beef patties with juicy tomatoes", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
      { name: "Bacon King", price: 849, description: "Two beef patties, thick-cut bacon, and cheese", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&q=80" },
      { name: "Chicken Royale", price: 549, description: "Crispy chicken breast with lettuce and mayo", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80" },
      { name: "Veggie Bean Burger", price: 499, description: "Tasty bean patty with fresh salad", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=800&q=80" },
      { name: "Steakhouse Burger", price: 899, description: "Beef patty with crispy onions and BBQ sauce", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80" },
      { name: "Chicken Nuggets (9pc)", price: 399, description: "Bite-sized crispy chicken pieces", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80" },
      { name: "Chili Cheese Bites", price: 299, description: "Melted cheese with spicy chili bits", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1603033331385-9982b654994f?w=800&q=80" },
      { name: "Large French Fries", price: 199, description: "Golden, crispy potato fries", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80" },
      { name: "Chocolate Milkshake", price: 349, description: "Creamy, thick chocolate milkshake", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80" },
    ]
  },
  {
    name: "Pizza Paradise",
    email: "pizzaparadise@gmail.com",
    phone: "9876543211",
    ownerName: "Maria Pizza",
    ownerEmail: "owner.pizza@gmail.com",
    cuisines: ["Italian", "Pizza"],
    address: { line1: "456 Pizza Ave", city: "Chicago", state: "IL", pinCode: "60601" },
    location: { type: "Point", coordinates: [-87.629798, 41.878114] as [number, number] },
    addOns: pizzaAddOns,
    menuItems: [
      { name: "Classic Margherita", price: 899, description: "Tomato sauce, mozzarella, and fresh basil", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=800&q=80" },
      { name: "Pepperoni Feast", price: 1099, description: "Double pepperoni and extra mozzarella", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80" },
      { name: "BBQ Chicken Pizza", price: 1199, description: "Chicken, onions, and smoky BBQ sauce", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
      { name: "Hawaiian Tropical", price: 999, description: "Ham, pineapple, and sweet corn", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80" },
      { name: "Meat Lovers", price: 1299, description: "Pepperoni, ham, beef, and sausage", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
      { name: "Veggie Supreme", price: 949, description: "Mushrooms, peppers, onions, and olives", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&q=80" },
      { name: "Garlic Pizza Bread", price: 449, description: "Fresh dough with garlic and herbs", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1620374645310-f9d97e733268?w=800&q=80" },
      { name: "Spicy Buffalo Wings", price: 599, description: "8 crispy wings with buffalo sauce", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80" },
      { name: "Creamy Tiramisu", price: 499, description: "Classic Italian coffee-flavored dessert", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80" },
      { name: "Pepsi (1.5L)", price: 149, description: "Chilled 1.5 liter bottle", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1629203851022-36c642a59392?w=800&q=80" },
    ]
  },
  {
    name: "Sushi World",
    email: "sushiworld@gmail.com",
    phone: "9876543212",
    ownerName: "Yuki Sushi",
    ownerEmail: "owner.sushi@gmail.com",
    cuisines: ["Japanese", "Sushi"],
    address: { line1: "789 Sushi Rd", city: "Los Angeles", state: "CA", pinCode: "90001" },
    location: { type: "Point", coordinates: [-118.243685, 34.052234] as [number, number] },
    addOns: sushiAddOns,
    menuItems: [
      { name: "Salmon Nigiri (4pc)", price: 1299, description: "Fresh salmon over premium sushi rice", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800&q=80" },
      { name: "Tuna Sashimi (5pc)", price: 1499, description: "Thick slices of raw bluefin tuna", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c170db76?w=800&q=80" },
      { name: "Classic California Roll", price: 799, description: "Crab, avocado, and cucumber with sesame", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80" },
      { name: "Dragon Special Roll", price: 1349, description: "Eel and cucumber topped with avocado", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80" },
      { name: "Tempura Prawns (6pc)", price: 899, description: "Lightly battered crispy king prawns", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1599321955419-7801382999d3?w=800&q=80" },
      { name: "Traditional Miso Soup", price: 249, description: "Soybean broth with tofu and seaweed", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80" },
      { name: "Salted Edamame", price: 349, description: "Steamed green soybeans with sea salt", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1591123720164-de1348028a82?w=800&q=80" },
      { name: "Chicken Teriyaki Don", price: 1149, description: "Grilled chicken with sweet soy on rice", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1591814441344-98448f220361?w=800&q=80" },
      { name: "Pan-Fried Pork Gyoza", price: 649, description: "5 dumplings with soy dipping sauce", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80" },
      { name: "Matcha Green Tea Ice Cream", price: 449, description: "Authentic Japanese green tea flavor", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1505394033343-43adc2f4108e?w=800&q=80" },
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const password = await bcrypt.hash("password123", 10);

    for (const data of restaurantsData) {
      console.log(`Seeding ${data.name}...`);

      // 1. Create/Find User
      let user = await User.findOne({ email: data.ownerEmail });
      if (!user) {
        user = await User.create({
          name: data.ownerName,
          email: data.ownerEmail,
          password: password,
          phone: data.phone,
          role: ROLES.KITCHEN,
          status: "ACTIVE",
        });
      }

      // 2. Create/Find Restaurant
      let restaurant = await Restaurant.findOne({ ownerId: user._id });
      if (!restaurant) {
        restaurant = await Restaurant.create({
          ownerId: user._id,
          ownerName: data.ownerName,
          name: data.name,
          email: data.email,
          phone: data.phone,
          cuisines: data.cuisines,
          address: data.address,
          location: data.location,
          status: RESTAURANT_STATUS.ACTIVE,
          isOpen: true,
          rating: 4.5,
        });
      }

      // 3. Clear existing Menu Items
      await MenuItem.deleteMany({ restaurantId: restaurant._id });

      // 4. Add Menu Items with Add-ons
      for (const item of data.menuItems) {
        await MenuItem.create({
          restaurantId: restaurant._id,
          ...item,
          isAvailable: true,
          showInMenu: true,
          category: "Main Course",
          tags: { isJain: false, isSpicy: false, isBestseller: true, isRecommended: true },
          addOns: data.addOns, // Give all 10 add-ons to each item in that restaurant
        });
      }
    }

    console.log("Seeding with 10 items and 30 total add-ons completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding restaurants:", error);
    process.exit(1);
  }
}

seed();
