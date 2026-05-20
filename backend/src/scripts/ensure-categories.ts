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
    name: "Pasta",
    description: "Creamy and spicy pasta dishes.",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&auto=format&fit=crop",
    order: 3,
    subcategories: ["Red Sauce", "White Sauce", "Green Sauce", "Asian Noodles"],
  },
  {
    name: "Biryani",
    description: "Aromatic and flavorful rice dishes.",
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
    subcategories: ["Spring Rolls", "Pakora", "Samosa", "Fries", "Nachos"],
  },
  {
    name: "Starters",
    description: "Appetizers and shareable starter platters.",
    image: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=600&auto=format&fit=crop",
    order: 10,
    subcategories: ["Veg Starters", "Non-Veg Starters", "Platters", "Dips & Sauces"],
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
];

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export const ensureCategories = async (): Promise<void> => {
  try {
    const existingCount = await Category.countDocuments();
    
    if (existingCount > 0) {
      console.log(`✅ Categories already exist (${existingCount} found). Skipping seed.`);
      return;
    }

    console.log("🌱 Seeding default categories...");

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

    console.log(`✅ Seeded ${defaultCategories.length} categories successfully.`);
  } catch (error) {
    console.error("⚠️  Warning: Failed to ensure categories exist:", error);
    // Don't throw - continue server startup even if seeding fails
  }
};
