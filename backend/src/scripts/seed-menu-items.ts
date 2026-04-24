import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { MenuItem } from "../modules/restaurant/restaurant.model";

export const menuItemsSeedData = [
  // --- BURGERS ---
  {
    name: "Classic Veggie Deluxe Burger",
    shortDescription: "A timeless favorite with a crispy veg patty.",
    description: "Our signature crispy vegetable patty topped with fresh lettuce, tomatoes, onions, and our secret creamy sauce, served on a toasted sesame bun.",
    price: 149,
    discountPrice: 129,
    category: "Burgers",
    subcategory: "Veg Burgers",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 15,
    calories: 450,
    ingredients: ["Veg Patty", "Sesame Bun", "Lettuce", "Tomato", "Mayo"],
    addons: [
      { name: "Extra Cheese Slice", price: 20 },
      { name: "Jalapenos", price: 15 }
    ],
    variants: [
      { name: "Regular", price: 149 },
      { name: "Double Patty", price: 199 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.5,
    ratingCount: 342,
    createdAt: new Date().toISOString()
  },
  {
    name: "Spicy Paneer Zinger Burger",
    shortDescription: "Crunchy paneer with a fiery kick.",
    description: "Thick slab of paneer coated in a spicy batter, deep-fried to perfection, and layered with spicy mayo and crunchy onions.",
    price: 189,
    discountPrice: 169,
    category: "Burgers",
    subcategory: "Veg Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: false,
    preparationTime: 18,
    calories: 520,
    ingredients: ["Paneer Slab", "Spicy Batter", "Onions", "Spicy Mayo"],
    addons: [
      { name: "Extra Sauce", price: 10 },
      { name: "Cheese Dip", price: 30 }
    ],
    variants: [
      { name: "Standard", price: 189 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.7,
    ratingCount: 512,
    createdAt: new Date().toISOString()
  },
  {
    name: "Crispy Chicken Mahaburger",
    shortDescription: "The ultimate chicken burger experience.",
    description: "A huge, juicy chicken breast fillet, breaded and fried, topped with melted cheese, pickles, and honey mustard sauce.",
    price: 249,
    discountPrice: 219,
    category: "Burgers",
    subcategory: "Chicken Burgers",
    image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: false,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 20,
    calories: 680,
    ingredients: ["Chicken Fillet", "Cheese", "Pickles", "Honey Mustard"],
    addons: [
      { name: "Bacon Strip", price: 50 },
      { name: "Fried Egg", price: 20 }
    ],
    variants: [
      { name: "Single Fillet", price: 249 },
      { name: "Double Fillet", price: 349 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 1205,
    createdAt: new Date().toISOString()
  },
  {
    name: "Aloo Tikki Surprise Burger",
    shortDescription: "Desi style aloo tikki with a twist.",
    description: "Crispy spiced potato patty served with mint chutney, tamarind sauce, and crunchy veggies in a soft bun.",
    price: 89,
    discountPrice: 79,
    category: "Burgers",
    subcategory: "Veg Burgers",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: true,
    isBestseller: true,
    isRecommended: false,
    preparationTime: 12,
    calories: 320,
    ingredients: ["Aloo Tikki", "Mint Chutney", "Tamarind Sauce", "Onion"],
    addons: [
      { name: "Cheese Slice", price: 15 }
    ],
    variants: [
      { name: "Regular", price: 89 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.3,
    ratingCount: 890,
    createdAt: new Date().toISOString()
  },
  {
    name: "Mutton Whopper Royale",
    shortDescription: "Premium mutton patty for the meat lovers.",
    description: "Flame-grilled succulent mutton patty with caramelized onions, swiss cheese, and truffle oil mayo.",
    price: 349,
    discountPrice: 299,
    category: "Burgers",
    subcategory: "Mutton Burgers",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: false,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 25,
    calories: 750,
    ingredients: ["Mutton Patty", "Caramelized Onions", "Swiss Cheese", "Truffle Mayo"],
    addons: [
      { name: "Mushrooms", price: 40 },
      { name: "Extra Patty", price: 150 }
    ],
    variants: [
      { name: "Standard", price: 349 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 245,
    createdAt: new Date().toISOString()
  },
  {
    name: "Peri Peri Chicken Burger",
    shortDescription: "Spicy African bird's eye chili flavored chicken.",
    description: "Grilled chicken thigh marinated in Peri Peri spices, topped with coleslaw and spicy peri-peri drizzle.",
    price: 219,
    discountPrice: 199,
    category: "Burgers",
    subcategory: "Chicken Burgers",
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 18,
    calories: 580,
    ingredients: ["Peri Peri Chicken", "Coleslaw", "Peri Peri Sauce"],
    addons: [
      { name: "Extra Peri Peri Sauce", price: 15 },
      { name: "Cheese Slice", price: 20 }
    ],
    variants: [
      { name: "Mild", price: 219 },
      { name: "Hot", price: 219 },
      { name: "Extra Hot", price: 219 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 678,
    createdAt: new Date().toISOString()
  },

  // --- PIZZA ---
  {
    name: "Margherita Basil Pizza",
    shortDescription: "The classic Italian masterpiece.",
    description: "Simply delicious with our house-made tomato sauce, fresh mozzarella, and aromatic basil leaves on a thin crust.",
    price: 299,
    discountPrice: 249,
    category: "Pizza",
    subcategory: "Veg Pizza",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbcd80ad59?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 20,
    calories: 800,
    ingredients: ["Tomato Sauce", "Mozzarella", "Fresh Basil", "Olive Oil"],
    addons: [
      { name: "Extra Cheese", price: 60 },
      { name: "Olive Topping", price: 40 }
    ],
    variants: [
      { name: "7 inch", price: 299 },
      { name: "10 inch", price: 499 },
      { name: "12 inch", price: 699 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 1540,
    createdAt: new Date().toISOString()
  },
  {
    name: "Farmhouse Fresh Pizza",
    shortDescription: "Loaded with garden fresh vegetables.",
    description: "A veggie lover's delight! Bell peppers, onions, mushrooms, tomatoes, and golden corn on a bed of cheesy goodness.",
    price: 399,
    discountPrice: 349,
    category: "Pizza",
    subcategory: "Veg Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: false,
    preparationTime: 25,
    calories: 950,
    ingredients: ["Bell Peppers", "Onions", "Mushrooms", "Corn", "Mozzarella"],
    addons: [
      { name: "Cheese Burst Crust", price: 99 },
      { name: "Paneer Cubes", price: 50 }
    ],
    variants: [
      { name: "Personal", price: 399 },
      { name: "Medium", price: 599 },
      { name: "Large", price: 799 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 820,
    createdAt: new Date().toISOString()
  },
  {
    name: "Pepperoni Overload Pizza",
    shortDescription: "Crispy pepperoni and lots of cheese.",
    description: "Classic American style pizza topped with a generous portion of premium pork pepperoni and mozzarella cheese.",
    price: 499,
    discountPrice: 449,
    category: "Pizza",
    subcategory: "Non-Veg Pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 22,
    calories: 1100,
    ingredients: ["Pepperoni", "Mozzarella", "Marinara Sauce"],
    addons: [
      { name: "Garlic Crust", price: 30 },
      { name: "Chili Flakes Extra", price: 0 }
    ],
    variants: [
      { name: "Medium", price: 499 },
      { name: "Large", price: 749 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 450,
    createdAt: new Date().toISOString()
  },
  {
    name: "Fiery Chicken Tikka Pizza",
    shortDescription: "Indian fusion at its best.",
    description: "Spicy chicken tikka chunks, red onions, and green chilies with a drizzle of mint mayo on a thin crust.",
    price: 449,
    discountPrice: 399,
    category: "Pizza",
    subcategory: "Non-Veg Pizza",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: true,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 25,
    calories: 1050,
    ingredients: ["Chicken Tikka", "Onions", "Green Chillies", "Mint Mayo"],
    addons: [
      { name: "Extra Tikka", price: 80 },
      { name: "Onion Rings Side", price: 60 }
    ],
    variants: [
      { name: "Personal", price: 449 },
      { name: "Medium", price: 649 },
      { name: "Large", price: 849 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.7,
    ratingCount: 310,
    createdAt: new Date().toISOString()
  },
  {
    name: "Paneer Makhani Pizza",
    shortDescription: "Rich makhani sauce with soft paneer.",
    description: "Topped with marinated cottage cheese, capsicum, and onions on a creamy makhani sauce base.",
    price: 379,
    discountPrice: 329,
    category: "Pizza",
    subcategory: "Veg Pizza",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 23,
    calories: 980,
    ingredients: ["Paneer", "Makhani Sauce", "Capsicum", "Onions"],
    addons: [
      { name: "Butter Drizzle", price: 20 }
    ],
    variants: [
      { name: "Regular", price: 379 },
      { name: "Medium", price: 579 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.5,
    ratingCount: 560,
    createdAt: new Date().toISOString()
  },
  {
    name: "BBQ Chicken Feast Pizza",
    shortDescription: "Smoky BBQ sauce and grilled chicken.",
    description: "Succulent BBQ chicken pieces, sweet corn, and jalapenos on a smoky barbecue sauce base.",
    price: 469,
    discountPrice: 419,
    category: "Pizza",
    subcategory: "Non-Veg Pizza",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: false,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 24,
    calories: 1020,
    ingredients: ["BBQ Chicken", "Sweet Corn", "Jalapenos", "BBQ Sauce"],
    addons: [
      { name: "Extra BBQ Sauce", price: 20 },
      { name: "Cheese Slice", price: 25 }
    ],
    variants: [
      { name: "Personal", price: 469 },
      { name: "Medium", price: 689 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 195,
    createdAt: new Date().toISOString()
  },

  // --- BIRYANI ---
  {
    name: "Hyderabadi Dum Biryani",
    shortDescription: "The king of all biryanis.",
    description: "Slow-cooked aromatic basmati rice with marinated tender chicken, saffron, and whole spices in a traditional handi.",
    price: 329,
    discountPrice: 289,
    category: "Biryani",
    subcategory: "Chicken Biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 35,
    calories: 850,
    ingredients: ["Basmati Rice", "Chicken", "Saffron", "Whole Spices"],
    addons: [
      { name: "Extra Salan", price: 0 },
      { name: "Raita", price: 20 },
      { name: "Boiled Egg", price: 15 }
    ],
    variants: [
      { name: "Single", price: 329 },
      { name: "Family Pack", price: 999 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 2450,
    createdAt: new Date().toISOString()
  },
  {
    name: "Lucknowi Veg Biryani",
    shortDescription: "Fragrant and subtle vegetable biryani.",
    description: "A delicate blend of garden fresh vegetables and long-grain rice, cooked in the Awadhi style with a hint of kewra.",
    price: 249,
    discountPrice: 219,
    category: "Biryani",
    subcategory: "Veg Biryani",
    image: "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 30,
    calories: 620,
    ingredients: ["Carrots", "Beans", "Green Peas", "Basmati Rice", "Kewra"],
    addons: [
      { name: "Roasted Paneer", price: 60 },
      { name: "Extra Masala", price: 10 }
    ],
    variants: [
      { name: "Regular", price: 249 },
      { name: "Full Handi", price: 449 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.7,
    ratingCount: 580,
    createdAt: new Date().toISOString()
  },
  {
    name: "Kolkata Mutton Biryani",
    shortDescription: "Biryani with the iconic potato.",
    description: "A unique biryani experience featuring succulent mutton and a slow-cooked potato, mildly spiced and full of flavor.",
    price: 449,
    discountPrice: 399,
    category: "Biryani",
    subcategory: "Mutton Biryani",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 40,
    calories: 980,
    ingredients: ["Mutton", "Potato", "Basmati Rice", "Rose Water"],
    addons: [
      { name: "Extra Potato", price: 25 },
      { name: "Egg", price: 15 }
    ],
    variants: [
      { name: "Regular", price: 449 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 890,
    createdAt: new Date().toISOString()
  },
  {
    name: "Spicy Egg Dum Biryani",
    shortDescription: "Hard-boiled eggs in aromatic rice.",
    description: "Fragrant rice layered with spicy masala eggs, caramelized onions, and fresh mint leaves.",
    price: 219,
    discountPrice: 189,
    category: "Biryani",
    subcategory: "Egg Biryani",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: true,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 25,
    calories: 680,
    ingredients: ["Eggs", "Rice", "Mint Leaves", "Fried Onions"],
    addons: [
      { name: "Extra Egg", price: 15 }
    ],
    variants: [
      { name: "Regular", price: 219 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.4,
    ratingCount: 420,
    createdAt: new Date().toISOString()
  },
  {
    name: "Paneer Tikka Biryani",
    shortDescription: "Tandoori paneer meets dum biryani.",
    description: "Chunks of paneer tikka layered with spiced basmati rice and cooked on 'dum' for that perfect smoky aroma.",
    price: 279,
    discountPrice: 249,
    category: "Biryani",
    subcategory: "Veg Biryani",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 30,
    calories: 720,
    ingredients: ["Paneer Tikka", "Basmati Rice", "Tandoori Spices"],
    addons: [
      { name: "Extra Paneer", price: 50 },
      { name: "Raita", price: 20 }
    ],
    variants: [
      { name: "Regular", price: 279 },
      { name: "Large", price: 479 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 650,
    createdAt: new Date().toISOString()
  },
  {
    name: "Butter Chicken Biryani",
    shortDescription: "Creamy butter chicken in a biryani.",
    description: "An indulgent fusion of creamy butter chicken gravy and aromatic dum biryani rice.",
    price: 369,
    discountPrice: 329,
    category: "Biryani",
    subcategory: "Chicken Biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 35,
    calories: 950,
    ingredients: ["Butter Chicken", "Rice", "Cream", "Butter"],
    addons: [
      { name: "Extra Gravy", price: 40 }
    ],
    variants: [
      { name: "Regular", price: 369 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 320,
    createdAt: new Date().toISOString()
  },

  // --- NORTH INDIAN ---
  {
    name: "Butter Chicken Masala",
    shortDescription: "Rich, creamy, and legendary.",
    description: "Classic North Indian dish with tender chicken pieces cooked in a velvety tomato and butter gravy.",
    price: 389,
    discountPrice: 349,
    category: "North Indian",
    subcategory: "Chicken Curries",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 25,
    calories: 550,
    ingredients: ["Chicken", "Butter", "Tomato Puree", "Cream"],
    addons: [
      { name: "Extra Butter", price: 20 },
      { name: "Butter Naan", price: 40 }
    ],
    variants: [
      { name: "Half", price: 249 },
      { name: "Full", price: 389 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 1850,
    createdAt: new Date().toISOString()
  },
  {
    name: "Dal Makhani Royale",
    shortDescription: "Slow-cooked black lentils.",
    description: "Whole black lentils simmered overnight on slow fire with butter and cream for a rich taste.",
    price: 249,
    discountPrice: 219,
    category: "North Indian",
    subcategory: "Dal Items",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 20,
    calories: 420,
    ingredients: ["Black Lentils", "Kidney Beans", "Butter", "Cream"],
    addons: [
      { name: "Garlic Naan", price: 45 },
      { name: "Jeera Rice", price: 120 }
    ],
    variants: [
      { name: "Standard", price: 249 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.7,
    ratingCount: 920,
    createdAt: new Date().toISOString()
  },
  {
    name: "Paneer Lababdar",
    shortDescription: "Cottage cheese in tangy gravy.",
    description: "Soft paneer cubes cooked in a luscious onion-tomato gravy with grated paneer and cream.",
    price: 319,
    discountPrice: 289,
    category: "North Indian",
    subcategory: "Paneer Curries",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 22,
    calories: 480,
    ingredients: ["Paneer", "Onions", "Tomatoes", "Spices", "Cream"],
    addons: [
      { name: "Extra Paneer", price: 60 }
    ],
    variants: [
      { name: "Half", price: 199 },
      { name: "Full", price: 319 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 740,
    createdAt: new Date().toISOString()
  },
  {
    name: "Kadhai Paneer Special",
    shortDescription: "Spicy and flavorful paneer.",
    description: "Paneer cooked with bell peppers and freshly ground spices in a traditional kadhai.",
    price: 299,
    discountPrice: 269,
    category: "North Indian",
    subcategory: "Paneer Curries",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 20,
    calories: 450,
    ingredients: ["Paneer", "Capsicum", "Kadhai Masala", "Onions"],
    addons: [
      { name: "Roti", price: 15 }
    ],
    variants: [
      { name: "Standard", price: 299 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 520,
    createdAt: new Date().toISOString()
  },
  {
    name: "Mutton Rogan Josh",
    shortDescription: "Kashmiri style mutton curry.",
    description: "Authentic Kashmiri mutton curry cooked with alkanet root and Kashmiri red chilies.",
    price: 499,
    discountPrice: 449,
    category: "North Indian",
    subcategory: "Mutton Curries",
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: true,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 45,
    calories: 680,
    ingredients: ["Mutton", "Kashmiri Chili", "Yogurt", "Ginger"],
    addons: [
      { name: "Laccha Paratha", price: 50 }
    ],
    variants: [
      { name: "Regular", price: 499 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 315,
    createdAt: new Date().toISOString()
  },
  {
    name: "Amritsari Kulcha with Chole",
    shortDescription: "Crispy kulcha with spicy chickpeas.",
    description: "Authentic Amritsari kulcha stuffed with potatoes and served with spicy pind chole and tamarind chutney.",
    price: 229,
    discountPrice: 199,
    category: "North Indian",
    subcategory: "Breads & Combos",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 18,
    calories: 520,
    ingredients: ["Refined Flour", "Potatoes", "Chickpeas", "Butter"],
    addons: [
      { name: "Extra Butter", price: 15 },
      { name: "Lassi", price: 60 }
    ],
    variants: [
      { name: "1 Pc", price: 129 },
      { name: "2 Pc", price: 229 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 1120,
    createdAt: new Date().toISOString()
  },

  // --- CHINESE ---
  {
    name: "Veg Manchurian Dry",
    shortDescription: "Classic Indo-Chinese appetizer.",
    description: "Deep-fried vegetable balls tossed in a tangy and spicy soy-based sauce with garlic and ginger.",
    price: 189,
    discountPrice: 169,
    category: "Chinese",
    subcategory: "Manchurian",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 15,
    calories: 380,
    ingredients: ["Cabbage", "Carrot", "Soy Sauce", "Garlic"],
    addons: [
      { name: "Extra Garlic", price: 10 }
    ],
    variants: [
      { name: "Dry", price: 189 },
      { name: "Gravy", price: 199 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.5,
    ratingCount: 840,
    createdAt: new Date().toISOString()
  },
  {
    name: "Chicken Hakka Noodles",
    shortDescription: "Wok-tossed noodles with chicken.",
    description: "Stir-fried noodles with succulent chicken pieces, scrambled eggs, and crisp vegetables in a light soy sauce.",
    price: 249,
    discountPrice: 219,
    category: "Chinese",
    subcategory: "Noodles",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 18,
    calories: 550,
    ingredients: ["Noodles", "Chicken", "Eggs", "Bell Peppers"],
    addons: [
      { name: "Extra Chicken", price: 50 },
      { name: "Schezwan Sauce", price: 20 }
    ],
    variants: [
      { name: "Regular", price: 249 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.7,
    ratingCount: 960,
    createdAt: new Date().toISOString()
  },
  {
    name: "Chilli Paneer Gravy",
    shortDescription: "Spicy paneer in oriental sauce.",
    description: "Cottage cheese cubes tossed with bell peppers and onions in a hot chilli sauce.",
    price: 229,
    discountPrice: 199,
    category: "Chinese",
    subcategory: "Chilli Items",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: false,
    preparationTime: 15,
    calories: 420,
    ingredients: ["Paneer", "Green Chillies", "Soy Sauce", "Capsicum"],
    addons: [
      { name: "Fried Rice Side", price: 100 }
    ],
    variants: [
      { name: "Dry", price: 229 },
      { name: "Gravy", price: 239 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 450,
    createdAt: new Date().toISOString()
  },
  {
    name: "Schezwan Chicken Fried Rice",
    shortDescription: "Fiery fried rice with chicken.",
    description: "A spicy and flavorful fried rice made with our house-special Schezwan sauce, chicken, and spring onions.",
    price: 269,
    discountPrice: 239,
    category: "Chinese",
    subcategory: "Fried Rice",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 20,
    calories: 620,
    ingredients: ["Rice", "Chicken", "Schezwan Sauce", "Celery"],
    addons: [
      { name: "Fried Egg", price: 20 }
    ],
    variants: [
      { name: "Regular", price: 269 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 520,
    createdAt: new Date().toISOString()
  },
  {
    name: "Honey Chilli Potato",
    shortDescription: "Sweet and spicy crispy potatoes.",
    description: "Crispy fried potato fingers tossed in a sweet honey and spicy chilli sauce, topped with sesame seeds.",
    price: 169,
    discountPrice: 149,
    category: "Chinese",
    subcategory: "Appetizers",
    image: "https://images.unsplash.com/photo-1601050633647-81a35d37c331?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 15,
    calories: 450,
    ingredients: ["Potato", "Honey", "Chilli Sauce", "Sesame Seeds"],
    addons: [],
    variants: [
      { name: "Standard", price: 169 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 1200,
    createdAt: new Date().toISOString()
  },
  {
    name: "Dim Sums Veg Basket",
    shortDescription: "Steamed vegetable dumplings.",
    description: "Delicate steamed dumplings stuffed with finely chopped vegetables, served with a spicy dip.",
    price: 199,
    discountPrice: 179,
    category: "Chinese",
    subcategory: "Momos",
    image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 12,
    calories: 220,
    ingredients: ["Flour", "Mixed Veg", "Ginger", "Garlic"],
    addons: [
      { name: "Chilli Oil", price: 15 }
    ],
    variants: [
      { name: "6 Pieces", price: 199 },
      { name: "10 Pieces", price: 299 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.4,
    ratingCount: 280,
    createdAt: new Date().toISOString()
  },

  // --- SOUTH INDIAN ---
  {
    name: "Masala Dosa Classic",
    shortDescription: "Crispy crepe with potato filling.",
    description: "A traditional South Indian rice crepe filled with a delicious spiced potato mash, served with sambar and chutneys.",
    price: 129,
    discountPrice: 109,
    category: "South Indian",
    subcategory: "Dosa",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 12,
    calories: 350,
    ingredients: ["Rice Batter", "Potatoes", "Mustard Seeds", "Curry Leaves"],
    addons: [
      { name: "Extra Ghee", price: 20 },
      { name: "Cheese Dosa", price: 40 }
    ],
    variants: [
      { name: "Standard", price: 129 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 1950,
    createdAt: new Date().toISOString()
  },
  {
    name: "Paneer Butter Masala Dosa",
    shortDescription: "Fusion dosa with paneer filling.",
    description: "Crispy dosa filled with paneer cubes tossed in a buttery tomato gravy.",
    price: 179,
    discountPrice: 159,
    category: "South Indian",
    subcategory: "Dosa",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: false,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 15,
    calories: 480,
    ingredients: ["Rice Batter", "Paneer", "Butter", "Tomato Sauce"],
    addons: [
      { name: "Extra Chutney", price: 10 }
    ],
    variants: [
      { name: "Standard", price: 179 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 340,
    createdAt: new Date().toISOString()
  },
  {
    name: "Idli Vada Combo",
    shortDescription: "Steamed rice cakes and lentil donut.",
    description: "Two soft idlis and one crispy medu vada served with piping hot sambar and coconut chutney.",
    price: 99,
    discountPrice: 89,
    category: "South Indian",
    subcategory: "Combo Plates",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 10,
    calories: 280,
    ingredients: ["Rice", "Urad Dal", "Spices", "Coconut"],
    addons: [
      { name: "Extra Vada", price: 30 }
    ],
    variants: [
      { name: "Standard", price: 99 }
    ],
    availability: { breakfast: true, lunch: true, dinner: false },
    rating: 4.7,
    ratingCount: 1250,
    createdAt: new Date().toISOString()
  },
  {
    name: "Onion Uttapam Special",
    shortDescription: "Thick savory pancake with onions.",
    description: "Thick rice pancake topped with a generous amount of onions, green chillies, and coriander.",
    price: 149,
    discountPrice: 129,
    category: "South Indian",
    subcategory: "Uttapam",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 15,
    calories: 320,
    ingredients: ["Rice Batter", "Onions", "Green Chillies", "Coriander"],
    addons: [
      { name: "Cheese Topping", price: 35 }
    ],
    variants: [
      { name: "Standard", price: 149 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.5,
    ratingCount: 210,
    createdAt: new Date().toISOString()
  },
  {
    name: "Ghee Roast Paper Dosa",
    shortDescription: "Paper-thin crispy ghee dosa.",
    description: "Extra large and extra thin crispy rice crepe roasted with pure cow ghee.",
    price: 159,
    discountPrice: 139,
    category: "South Indian",
    subcategory: "Dosa",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 12,
    calories: 380,
    ingredients: ["Rice Batter", "Ghee"],
    addons: [
      { name: "Potato Masala Side", price: 30 }
    ],
    variants: [
      { name: "Standard", price: 159 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 780,
    createdAt: new Date().toISOString()
  },
  {
    name: "Rava Masala Dosa",
    shortDescription: "Semolina based crispy dosa.",
    description: "Crispy and net-textured dosa made with semolina and rice flour, filled with potato masala.",
    price: 149,
    discountPrice: 129,
    category: "South Indian",
    subcategory: "Dosa",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: false,
    isRecommended: false,
    preparationTime: 18,
    calories: 410,
    ingredients: ["Semolina", "Rice Flour", "Green Chillies", "Ginger"],
    addons: [],
    variants: [
      { name: "Standard", price: 149 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.4,
    ratingCount: 150,
    createdAt: new Date().toISOString()
  },

  // --- STREET FOOD ---
  {
    name: "Classic Pav Bhaji",
    shortDescription: "Mumbai's favorite street food.",
    description: "A spicy blend of mashed vegetables cooked in butter and special pav bhaji masala, served with soft buttered buns.",
    price: 159,
    discountPrice: 139,
    category: "Street Food",
    subcategory: "Pav Bhaji",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 15,
    calories: 580,
    ingredients: ["Potatoes", "Cauliflower", "Butter", "Pav Bhaji Masala"],
    addons: [
      { name: "Extra Pav", price: 20 },
      { name: "Extra Butter", price: 15 },
      { name: "Cheese Topping", price: 30 }
    ],
    variants: [
      { name: "Regular", price: 159 },
      { name: "Cheese Pav Bhaji", price: 189 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 2200,
    createdAt: new Date().toISOString()
  },
  {
    name: "Mumbai Vada Pav",
    shortDescription: "The iconic Indian burger.",
    description: "Spicy potato dumpling fried in chickpea batter, served in a bun with dry garlic chutney and fried chillies.",
    price: 49,
    discountPrice: 39,
    category: "Street Food",
    subcategory: "Vada Pav",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 5,
    calories: 250,
    ingredients: ["Potato", "Gram Flour", "Garlic Chutney", "Pav"],
    addons: [
      { name: "Extra Chutney", price: 5 }
    ],
    variants: [
      { name: "Single", price: 49 },
      { name: "Double", price: 89 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 3500,
    createdAt: new Date().toISOString()
  },
  {
    name: "Pani Puri Platter",
    shortDescription: "Tangy and refreshing water balls.",
    description: "Crispy puris filled with spiced potato and chickpea, served with tangy tamarind water and spicy mint water.",
    price: 89,
    discountPrice: 79,
    category: "Street Food",
    subcategory: "Pani Puri",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 5,
    calories: 180,
    ingredients: ["Semolina Puris", "Mint Water", "Tamarind Water", "Potatoes"],
    addons: [],
    variants: [
      { name: "8 Pieces", price: 89 },
      { name: "Family Pack (50 Pcs)", price: 449 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.7,
    ratingCount: 1800,
    createdAt: new Date().toISOString()
  },
  {
    name: "Chole Bhature",
    shortDescription: "Hearty North Indian breakfast.",
    description: "Deep-fried fluffy bread served with spicy chickpea curry, onions, and pickles.",
    price: 199,
    discountPrice: 179,
    category: "Street Food",
    subcategory: "Chole Bhature",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 20,
    calories: 850,
    ingredients: ["Refined Flour", "Yogurt", "Chickpeas", "Indian Spices"],
    addons: [
      { name: "Extra Bhatura", price: 40 },
      { name: "Paneer Bhatura", price: 60 }
    ],
    variants: [
      { name: "Standard (2 Pcs)", price: 199 }
    ],
    availability: { breakfast: true, lunch: true, dinner: false },
    rating: 4.8,
    ratingCount: 2800,
    createdAt: new Date().toISOString()
  },
  {
    name: "Dahi Papdi Chaat",
    shortDescription: "Cool and tangy yogurt snack.",
    description: "Crispy papdis topped with boiled potatoes, chickpeas, chilled yogurt, and sweet-spicy chutneys.",
    price: 119,
    discountPrice: 99,
    category: "Street Food",
    subcategory: "Chaat",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 10,
    calories: 320,
    ingredients: ["Flour Crackers", "Yogurt", "Tamarind Chutney", "Sev"],
    addons: [],
    variants: [
      { name: "Standard", price: 119 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 540,
    createdAt: new Date().toISOString()
  },
  {
    name: "Chicken Kati Roll",
    shortDescription: "Street style chicken wrap.",
    description: "Juicy chicken tandoori chunks wrapped in a flaky paratha with onions and green chutney.",
    price: 169,
    discountPrice: 149,
    category: "Street Food",
    subcategory: "Rolls",
    image: "https://images.unsplash.com/photo-1625944525533-473f1e9c2c14?q=80&w=800&auto=format&fit=crop",
    isVeg: false,
    isJain: false,
    isSpicy: true,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 15,
    calories: 420,
    ingredients: ["Paratha", "Chicken Tikka", "Onions", "Green Chutney"],
    addons: [
      { name: "Extra Egg Layer", price: 20 },
      { name: "Extra Cheese", price: 30 }
    ],
    variants: [
      { name: "Single Roll", price: 169 },
      { name: "Double Roll", price: 299 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.7,
    ratingCount: 950,
    createdAt: new Date().toISOString()
  },

  // --- BEVERAGES ---
  {
    name: "Classic Cold Coffee",
    shortDescription: "Creamy and refreshing coffee.",
    description: "Rich blend of coffee, milk, and vanilla ice cream, topped with chocolate syrup.",
    price: 149,
    discountPrice: 129,
    category: "Beverages",
    subcategory: "Cold Coffee",
    image: "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 10,
    calories: 350,
    ingredients: ["Coffee", "Milk", "Ice Cream", "Sugar"],
    addons: [
      { name: "Extra Ice Cream Scoop", price: 40 },
      { name: "Chocolate Chips", price: 20 }
    ],
    variants: [
      { name: "Regular", price: 149 },
      { name: "Large", price: 189 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 1500,
    createdAt: new Date().toISOString()
  },
  {
    name: "Fresh Lime Soda",
    shortDescription: "Zesty and bubbling refresher.",
    description: "Squeezed fresh lime with soda and your choice of sweet or salt.",
    price: 89,
    discountPrice: 79,
    category: "Beverages",
    subcategory: "Refreshers",
    image: "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 5,
    calories: 80,
    ingredients: ["Lime", "Soda", "Sugar/Salt", "Ice"],
    addons: [],
    variants: [
      { name: "Sweet", price: 89 },
      { name: "Salt", price: 89 },
      { name: "Mixed", price: 89 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.5,
    ratingCount: 650,
    createdAt: new Date().toISOString()
  },
  {
    name: "Masala Chai",
    shortDescription: "The heart of Indian mornings.",
    description: "Brewed with premium tea leaves, milk, ginger, and cardamom.",
    price: 59,
    discountPrice: 49,
    category: "Beverages",
    subcategory: "Tea",
    image: "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 10,
    calories: 120,
    ingredients: ["Tea Leaves", "Milk", "Ginger", "Cardamom"],
    addons: [],
    variants: [
      { name: "Standard", price: 59 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 4200,
    createdAt: new Date().toISOString()
  },
  {
    name: "Mango Thick Shake",
    shortDescription: "Indulgent seasonal mango shake.",
    description: "Made with real Alfonso mango pulp and rich creamy milk.",
    price: 179,
    discountPrice: 159,
    category: "Beverages",
    subcategory: "Milkshakes",
    image: "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: false,
    preparationTime: 12,
    calories: 450,
    ingredients: ["Mango Pulp", "Milk", "Sugar"],
    addons: [
      { name: "Dry Fruits", price: 30 }
    ],
    variants: [
      { name: "Regular", price: 179 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.7,
    ratingCount: 320,
    createdAt: new Date().toISOString()
  },
  {
    name: "Watermelon Juice",
    shortDescription: "Pure fresh fruit juice.",
    description: "100% fresh watermelon juice with no added sugar or preservatives.",
    price: 119,
    discountPrice: 99,
    category: "Beverages",
    subcategory: "Juices",
    image: "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 8,
    calories: 90,
    ingredients: ["Fresh Watermelon"],
    addons: [
      { name: "Mint Leaves", price: 10 }
    ],
    variants: [
      { name: "Standard", price: 119 }
    ],
    availability: { breakfast: true, lunch: true, dinner: true },
    rating: 4.6,
    ratingCount: 180,
    createdAt: new Date().toISOString()
  },
  {
    name: "Oreo Mud Shake",
    shortDescription: "Chocolatey oreo goodness.",
    description: "Thick chocolate shake blended with crunchy Oreo cookies and cream.",
    price: 189,
    discountPrice: 169,
    category: "Beverages",
    subcategory: "Milkshakes",
    image: "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 12,
    calories: 580,
    ingredients: ["Oreo Cookies", "Chocolate Syrup", "Milk", "Whipped Cream"],
    addons: [
      { name: "Extra Oreos", price: 25 }
    ],
    variants: [
      { name: "Standard", price: 189 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 450,
    createdAt: new Date().toISOString()
  },

  // --- DESSERTS ---
  {
    name: "Death by Chocolate",
    shortDescription: "The ultimate chocolate indulgence.",
    description: "Warm chocolate brownie with chocolate ice cream, chocolate sauce, and nuts.",
    price: 249,
    discountPrice: 219,
    category: "Desserts",
    subcategory: "Cakes",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 15,
    calories: 850,
    ingredients: ["Chocolate Brownie", "Chocolate Ice Cream", "Ganache"],
    addons: [
      { name: "Extra Choco Chips", price: 20 }
    ],
    variants: [
      { name: "Standard", price: 249 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 1200,
    createdAt: new Date().toISOString()
  },
  {
    name: "Gulab Jamun (2 Pcs)",
    shortDescription: "Soft and sweet berry-sized balls.",
    description: "Traditional Indian dessert made of milk solids, deep-fried and soaked in sugar syrup.",
    price: 89,
    discountPrice: 79,
    category: "Desserts",
    subcategory: "Indian Sweets",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 5,
    calories: 320,
    ingredients: ["Khoa", "Sugar Syrup", "Cardamom"],
    addons: [
      { name: "With Vanilla Ice Cream", price: 50 }
    ],
    variants: [
      { name: "2 Pcs", price: 89 },
      { name: "5 Pcs", price: 199 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 2500,
    createdAt: new Date().toISOString()
  },
  {
    name: "New York Cheesecake",
    shortDescription: "Creamy and smooth cheesecake.",
    description: "Classic baked cheesecake on a graham cracker crust, served with berry compote.",
    price: 299,
    discountPrice: 269,
    category: "Desserts",
    subcategory: "Pastries",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: false,
    isBestseller: false,
    isRecommended: true,
    preparationTime: 10,
    calories: 450,
    ingredients: ["Cream Cheese", "Graham Crackers", "Berry Compote"],
    addons: [],
    variants: [
      { name: "Slice", price: 299 },
      { name: "Whole Cake (1kg)", price: 1499 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.7,
    ratingCount: 380,
    createdAt: new Date().toISOString()
  },
  {
    name: "Sizzling Brownie",
    shortDescription: "Brownie on a hot sizzler plate.",
    description: "A gooey chocolate brownie served on a hot sizzler plate with a scoop of vanilla ice cream and molten chocolate.",
    price: 269,
    discountPrice: 239,
    category: "Desserts",
    subcategory: "Brownies",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 15,
    calories: 780,
    ingredients: ["Brownie", "Vanilla Ice Cream", "Chocolate Sauce"],
    addons: [],
    variants: [
      { name: "Standard", price: 269 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.9,
    ratingCount: 890,
    createdAt: new Date().toISOString()
  },
  {
    name: "Rasmalai (2 Pcs)",
    shortDescription: "Soft paneer discs in saffron milk.",
    description: "Creamy and soft cottage cheese discs soaked in sweetened, thickened milk flavored with saffron and pistachios.",
    price: 129,
    discountPrice: 119,
    category: "Desserts",
    subcategory: "Indian Sweets",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: true,
    isSpicy: false,
    isBestseller: true,
    isRecommended: true,
    preparationTime: 5,
    calories: 280,
    ingredients: ["Milk", "Paneer", "Saffron", "Pistachios"],
    addons: [],
    variants: [
      { name: "2 Pcs", price: 129 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.8,
    ratingCount: 1100,
    createdAt: new Date().toISOString()
  },
  {
    name: "Red Velvet Pastry",
    shortDescription: "Classic red velvet with cream cheese.",
    description: "Fluffy red velvet sponge layered with smooth cream cheese frosting.",
    price: 159,
    discountPrice: 139,
    category: "Desserts",
    subcategory: "Pastries",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop",
    isVeg: true,
    isJain: false,
    isSpicy: false,
    isBestseller: false,
    isRecommended: false,
    preparationTime: 8,
    calories: 380,
    ingredients: ["Red Velvet Sponge", "Cream Cheese Frosting"],
    addons: [],
    variants: [
      { name: "Slice", price: 159 }
    ],
    availability: { breakfast: false, lunch: true, dinner: true },
    rating: 4.5,
    ratingCount: 420,
    createdAt: new Date().toISOString()
  }
];

const run = async (): Promise<void> => {
  await connectDB();
  
  // Note: To use this script, you need a valid restaurant ID.
  // This is a template for the seed script.
  console.log("Ready to seed menu items. Please ensure you have a restaurantId to associate these with.");
  
  // for (const item of menuItemsSeedData) {
  //   await MenuItem.create({
  //     ...item,
  //     restaurantId: "YOUR_RESTAURANT_ID_HERE",
  //     tags: {
  //       isJain: item.isJain,
  //       isSpicy: item.isSpicy,
  //       isBestseller: item.isBestseller,
  //       isRecommended: item.isRecommended
  //     },
  //     imageUrl: item.image,
  //     preparationTimeMins: item.preparationTime,
  //     addOns: item.addons,
  //     availabilitySlots: Object.entries(item.availability)
  //       .filter(([_, available]) => available)
  //       .map(([slot, _]) => slot.toUpperCase())
  //   });
  // }
};

if (require.main === module) {
  run().catch(console.error);
}
