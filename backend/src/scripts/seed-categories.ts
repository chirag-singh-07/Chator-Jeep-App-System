import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Category } from "../modules/category/category.model";

const defaultCategories = [
  {
    name: "Burgers",
    description: "Classic and premium burgers for fast-moving menus.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop",
    order: 1,
    subcategories: ["Veg Burgers", "Chicken Burgers", "Mutton Burgers", "Cheese Burgers", "Loaded Burgers"],
  },
  {
    name: "Pizza",
    description: "Popular pizza formats for everyday and party orders.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop",
    order: 2,
    subcategories: ["Veg Pizza", "Chicken Pizza", "Paneer Pizza", "Farmhouse Pizza", "Cheese Burst Pizza"],
  },
  {
    name: "Wraps",
    description: "Portable wraps and rolls for lunch, snacks, and late-night demand.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop",
    order: 3,
    subcategories: ["Paneer Wraps", "Chicken Wraps", "Egg Wraps", "Veg Rolls", "Kebab Wraps"],
  },
  {
    name: "Sandwiches",
    description: "Toasties, grilled sandwiches, and layered handhelds.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop",
    order: 4,
    subcategories: ["Grilled Sandwiches", "Club Sandwiches", "Veg Sandwiches", "Chicken Sandwiches"],
  },
  {
    name: "Biryani",
    description: "Signature rice bowls and biryani formats.",
    image: "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?w=600&auto=format&fit=crop",
    order: 5,
    subcategories: ["Chicken Biryani", "Mutton Biryani", "Veg Biryani", "Paneer Biryani", "Egg Biryani"],
  },
  {
    name: "North Indian",
    description: "Curries, breads, and hearty North Indian staples.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop",
    order: 6,
    subcategories: ["Paneer Curries", "Chicken Curries", "Dal Items", "Naan & Roti", "Rice Combos"],
  },
  {
    name: "Chinese",
    description: "Indian-Chinese favorites with strong evening demand.",
    image: "https://images.unsplash.com/photo-1583032015879-e5022cb87c3b?w=600&auto=format&fit=crop",
    order: 7,
    subcategories: ["Noodles", "Fried Rice", "Manchurian", "Chilli Chicken", "Soups"],
  },
  {
    name: "South Indian",
    description: "Breakfast and all-day South Indian comfort food.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop",
    order: 8,
    subcategories: ["Dosa", "Idli", "Vada", "Uttapam", "Combo Plates"],
  },
  {
    name: "Snacks",
    description: "Fast-moving evening snacks and sharable bites.",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop",
    order: 9,
    subcategories: ["Fries", "Momos", "Spring Rolls", "Samosa", "Garlic Bread"],
  },
  {
    name: "Street Food",
    description: "Popular Indian street-style snacks and chaat.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop",
    order: 10,
    subcategories: ["Chaat", "Pav Bhaji", "Vada Pav", "Pani Puri", "Dahi Items"],
  },
  {
    name: "Pasta",
    description: "Creamy, red sauce, and baked pasta variations.",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&auto=format&fit=crop",
    order: 11,
    subcategories: ["White Sauce Pasta", "Red Sauce Pasta", "Pink Sauce Pasta", "Baked Pasta"],
  },
  {
    name: "Salads",
    description: "Fresh bowls for light meals and healthy add-ons.",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&auto=format&fit=crop",
    order: 12,
    subcategories: ["Veg Salads", "Chicken Salads", "Protein Bowls", "Fruit Salads"],
  },
  {
    name: "Desserts",
    description: "Classic sweets, cakes, and indulgent finishes.",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop",
    order: 13,
    subcategories: ["Cakes", "Pastries", "Brownies", "Ice Cream", "Indian Sweets"],
  },
  {
    name: "Beverages",
    description: "Refreshers, coffees, teas, and premium shakes.",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop",
    order: 14,
    subcategories: ["Soft Drinks", "Cold Coffee", "Tea", "Milkshakes", "Juices"],
  },
  {
    name: "Breakfast",
    description: "Quick breakfast items for morning orders.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop",
    order: 15,
    subcategories: ["Paratha", "Poha", "Upma", "Omelette", "Breakfast Combos"],
  },
  {
    name: "Thali & Combos",
    description: "Meal boxes, executive combos, and full thalis.",
    image: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=600&auto=format&fit=crop",
    order: 16,
    subcategories: ["Veg Thali", "Non-Veg Thali", "Lunch Combos", "Family Meals"],
  },
  {
    name: "Healthy Meals",
    description: "Balanced meals built for nutrition-focused customers.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop",
    order: 17,
    subcategories: ["Low-Calorie Meals", "High-Protein Meals", "Keto Bowls", "Vegan Meals"],
  },
  {
    name: "Bakery",
    description: "Fresh bakes and savory bakery staples.",
    image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&auto=format&fit=crop",
    order: 18,
    subcategories: ["Cookies", "Muffins", "Puffs", "Croissants", "Buns"],
  },
    {
    name: "Fast Food",
    description: "Quick bites and popular fast food combos.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop",
    order: 19,
    subcategories: ["Combo Meals", "Hot Dogs", "Nuggets", "Fries Combos"],
  },
  {
    name: "Seafood",
    description: "Fresh and flavorful seafood dishes.",
    image: "https://images.unsplash.com/photo-1617196038435-9e5c5f0c0c63?w=600&auto=format&fit=crop",
    order: 20,
    subcategories: ["Fish Curry", "Prawns", "Grilled Fish", "Seafood Platters"],
  },
  {
    name: "Tandoor",
    description: "Smoky and flavorful tandoori specials.",
    image: "https://images.unsplash.com/photo-1604908176997-431c7f8b9d16?w=600&auto=format&fit=crop",
    order: 21,
    subcategories: ["Tandoori Chicken", "Paneer Tikka", "Seekh Kebab", "Tandoori Roti"],
  },
  {
    name: "Kebabs",
    description: "Juicy and grilled kebab varieties.",
    image: "https://images.unsplash.com/photo-1603899122529-57d79b4c07c4?w=600&auto=format&fit=crop",
    order: 22,
    subcategories: ["Chicken Kebabs", "Mutton Kebabs", "Veg Kebabs", "Shawarma"],
  },
  {
    name: "Rolls",
    description: "Street-style rolls and frankies.",
    image: "https://images.unsplash.com/photo-1625944525533-473f1e9c2c14?w=600&auto=format&fit=crop",
    order: 23,
    subcategories: ["Veg Rolls", "Chicken Rolls", "Paneer Rolls", "Egg Rolls"],
  },
  {
    name: "Paratha",
    description: "Stuffed and plain paratha varieties.",
    image: "https://images.unsplash.com/photo-1601050690117-94f5f6fa4c47?w=600&auto=format&fit=crop",
    order: 24,
    subcategories: ["Aloo Paratha", "Paneer Paratha", "Plain Paratha", "Stuffed Paratha"],
  },
  {
    name: "Momos",
    description: "Steamed and fried dumplings.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop",
    order: 25,
    subcategories: ["Veg Momos", "Chicken Momos", "Fried Momos", "Tandoori Momos"],
  },
  {
    name: "Ice Cream",
    description: "Cool and creamy dessert options.",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&auto=format&fit=crop",
    order: 26,
    subcategories: ["Scoops", "Sundaes", "Cones", "Family Packs"],
  },
  {
    name: "Shakes & Smoothies",
    description: "Thick shakes and healthy smoothies.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop",
    order: 27,
    subcategories: ["Chocolate Shakes", "Fruit Smoothies", "Protein Shakes", "Cold Drinks"],
  },
  {
    name: "Juices",
    description: "Freshly squeezed juices and detox drinks.",
    image: "https://images.unsplash.com/photo-1558640476-437a2b9438a2?w=600&auto=format&fit=crop",
    order: 28,
    subcategories: ["Orange Juice", "Apple Juice", "Mixed Juice", "Detox Drinks"],
  },
  {
    name: "Coffee",
    description: "Hot and cold coffee beverages.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop",
    order: 29,
    subcategories: ["Espresso", "Cappuccino", "Latte", "Cold Coffee"],
  },
  {
    name: "Tea",
    description: "Traditional and flavored tea options.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop",
    order: 30,
    subcategories: ["Masala Tea", "Green Tea", "Black Tea", "Iced Tea"],
  },
  {
    name: "Sweets",
    description: "Traditional Indian mithai and sweets.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop",
    order: 31,
    subcategories: ["Gulab Jamun", "Rasgulla", "Barfi", "Ladoo"],
  },
  {
    name: "Chaats",
    description: "Tangy and spicy street chaat items.",
    image: "https://images.unsplash.com/photo-1604908177522-402fdc33c2b3?w=600&auto=format&fit=crop",
    order: 32,
    subcategories: ["Bhel Puri", "Sev Puri", "Dahi Puri", "Papdi Chaat"],
  },
  {
    name: "Soups",
    description: "Warm and comforting soups.",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop",
    order: 33,
    subcategories: ["Veg Soup", "Chicken Soup", "Hot & Sour", "Sweet Corn"],
  },
  {
    name: "Grill",
    description: "Grilled meats and vegetables.",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop",
    order: 34,
    subcategories: ["Grilled Chicken", "Grilled Fish", "Veg Grill", "BBQ Platters"],
  },
  {
    name: "BBQ",
    description: "Barbecue specialties and smoky dishes.",
    image: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=600&auto=format&fit=crop",
    order: 35,
    subcategories: ["BBQ Chicken", "BBQ Wings", "BBQ Paneer", "BBQ Combos"],
  },
  {
    name: "Mexican",
    description: "Mexican flavors and spicy delights.",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop",
    order: 36,
    subcategories: ["Tacos", "Burritos", "Nachos", "Quesadillas"],
  },
  {
    name: "Italian",
    description: "Classic Italian cuisine beyond pasta and pizza.",
    image: "https://images.unsplash.com/photo-1608756687911-aa1599ab3bd2?w=600&auto=format&fit=crop",
    order: 37,
    subcategories: ["Risotto", "Lasagna", "Ravioli", "Garlic Bread"],
  },
  {
    name: "Continental",
    description: "Western-style dishes and meals.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop",
    order: 38,
    subcategories: ["Steak", "Grilled Veg", "Mashed Potato", "Continental Combos"],
  }
];

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const run = async (): Promise<void> => {
  await connectDB();

  for (const category of defaultCategories) {
    const slug = slugify(category.name);

    await Category.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: category.name,
          slug,
          description: category.description,
          image: category.image,
          order: category.order,
          isActive: true,
          subcategories: category.subcategories,
        },
      },
      { upsert: true, new: true }
    ).exec();
  }

  console.log(`Seeded ${defaultCategories.length} categories.`);
};

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to seed categories: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
