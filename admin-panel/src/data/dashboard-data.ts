import type { AdminProfile, Category, FoodItem, NavigationItem, OrderRow, Restaurant, StatsCard, User } from "@/types/dashboard";

export const statsCards: StatsCard[] = [
  { title: "Total Orders", value: "12,480", trend: "+8.4% vs last period", trendUp: true },
  { title: "Revenue", value: "Rs 24.8L", trend: "+11.2% vs last period", trendUp: true },
  { title: "Active Kitchens", value: "34", trend: "+2 new kitchens", trendUp: true },
  { title: "Delivery Partners", value: "128", trend: "-1.8% active today", trendUp: false },
  { title: "Avg Prep Time", value: "19 min", trend: "-6.2% faster", trendUp: true },
  { title: "Cancellation Rate", value: "2.1%", trend: "-0.4% improvement", trendUp: true }
];

export const ordersTrendData = [
  { label: "Mon", orders: 820 },
  { label: "Tue", orders: 930 },
  { label: "Wed", orders: 880 },
  { label: "Thu", orders: 1020 },
  { label: "Fri", orders: 1210 },
  { label: "Sat", orders: 1340 },
  { label: "Sun", orders: 1180 }
];

export const revenueTrendData = [
  { label: "W1", revenue: 3.6 },
  { label: "W2", revenue: 4.1 },
  { label: "W3", revenue: 4.5 },
  { label: "W4", revenue: 5.2 },
  { label: "W5", revenue: 4.8 },
  { label: "W6", revenue: 5.6 },
  { label: "W7", revenue: 5.9 }
];

export const categoryDistributionData = [
  { name: "Burgers", value: 28 },
  { name: "Wraps", value: 18 },
  { name: "Bowls", value: 14 },
  { name: "Beverages", value: 22 },
  { name: "Desserts", value: 18 }
];

export const allOrders: OrderRow[] = [
  {
    id: "CJ-12091",
    customerId: "usr-riya",
    customerName: "Riya Mehta",
    kitchenId: "kit-north",
    kitchenName: "North Hub Kitchen",
    status: "Preparing",
    amount: 680,
    date: "2026-04-19 12:10",
    createdAt: "2026-04-19 12:10",
    updatedAt: "2026-04-19 12:16",
    items: [
      { name: "Paneer Tikka Wrap", qty: 2, price: 249 },
      { name: "Peri Peri Fries", qty: 1, price: 182 }
    ],
    customerEmail: "riya.m@example.com",
    customerPhone: "+91 98110 22334",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    transactionId: "txn-884201",
    deliveryAddress: "Sector 21, Noida",
    rider: "Not assigned",
    deliveryEta: "25 mins",
    timeline: [
      { label: "Order Placed", time: "12:10 PM", done: true },
      { label: "Accepted by Kitchen", time: "12:12 PM", done: true },
      { label: "Preparing", time: "12:16 PM", done: true },
      { label: "Out for Delivery", time: "--", done: false },
      { label: "Delivered", time: "--", done: false }
    ]
  },
  {
    id: "CJ-12090",
    customerId: "usr-aman",
    customerName: "Aman Gupta",
    kitchenId: "kit-central",
    kitchenName: "Central Cloud Kitchen",
    status: "Out for Delivery",
    amount: 1240,
    date: "2026-04-19 11:48",
    createdAt: "2026-04-19 11:48",
    updatedAt: "2026-04-19 12:20",
    items: [
      { name: "Family Burger Box", qty: 1, price: 999 },
      { name: "Cold Coffee", qty: 2, price: 121 }
    ],
    customerEmail: "aman.g@example.com",
    customerPhone: "+91 98990 33221",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    transactionId: "txn-884202",
    deliveryAddress: "DLF Phase 3, Gurgaon",
    rider: "Sandeep Yadav",
    deliveryEta: "12 mins",
    timeline: [
      { label: "Order Placed", time: "11:48 AM", done: true },
      { label: "Accepted by Kitchen", time: "11:50 AM", done: true },
      { label: "Preparing", time: "11:55 AM", done: true },
      { label: "Out for Delivery", time: "12:20 PM", done: true },
      { label: "Delivered", time: "--", done: false }
    ]
  },
  {
    id: "CJ-12088",
    customerId: "usr-nikhil",
    customerName: "Nikhil Rao",
    kitchenId: "kit-south",
    kitchenName: "South Hub Kitchen",
    status: "Completed",
    amount: 460,
    date: "2026-04-19 10:25",
    createdAt: "2026-04-19 10:25",
    updatedAt: "2026-04-19 11:08",
    items: [
      { name: "Makhani Bowl", qty: 1, price: 299 },
      { name: "Masala Soda", qty: 1, price: 161 }
    ],
    customerEmail: "nikhil.r@example.com",
    customerPhone: "+91 99881 77211",
    paymentMethod: "Wallet",
    paymentStatus: "Paid",
    transactionId: "txn-884203",
    deliveryAddress: "Koramangala 5th Block, Bengaluru",
    rider: "Rakesh P",
    deliveryEta: "Delivered",
    timeline: [
      { label: "Order Placed", time: "10:25 AM", done: true },
      { label: "Accepted by Kitchen", time: "10:27 AM", done: true },
      { label: "Preparing", time: "10:30 AM", done: true },
      { label: "Out for Delivery", time: "10:54 AM", done: true },
      { label: "Delivered", time: "11:08 AM", done: true }
    ]
  },
  {
    id: "CJ-12084",
    customerId: "usr-muskan",
    customerName: "Muskan Arora",
    kitchenId: "kit-east",
    kitchenName: "East Quick Kitchen",
    status: "Unassigned",
    amount: 840,
    date: "2026-04-19 09:58",
    createdAt: "2026-04-19 09:58",
    updatedAt: "2026-04-19 10:06",
    items: [
      { name: "Loaded Pizza Slice", qty: 2, price: 299 },
      { name: "Mojito", qty: 2, price: 121 }
    ],
    customerEmail: "muskan.a@example.com",
    customerPhone: "+91 99921 33912",
    paymentMethod: "COD",
    paymentStatus: "Pending",
    transactionId: "txn-884204",
    deliveryAddress: "Salt Lake, Kolkata",
    rider: "Not assigned",
    deliveryEta: "Not assigned",
    timeline: [
      { label: "Order Placed", time: "09:58 AM", done: true },
      { label: "Accepted by Kitchen", time: "10:01 AM", done: true },
      { label: "Preparing", time: "10:06 AM", done: true },
      { label: "Out for Delivery", time: "--", done: false },
      { label: "Delivered", time: "--", done: false }
    ]
  },
  {
    id: "CJ-12079",
    customerId: "usr-dev",
    customerName: "Dev Sharma",
    kitchenId: "kit-west",
    kitchenName: "West Cloud Kitchen",
    status: "Cancelled",
    amount: 350,
    date: "2026-04-19 08:44",
    createdAt: "2026-04-19 08:44",
    updatedAt: "2026-04-19 09:15",
    items: [{ name: "Combo Roll Box", qty: 1, price: 350 }],
    customerEmail: "dev.s@example.com",
    customerPhone: "+91 98113 88872",
    paymentMethod: "UPI",
    paymentStatus: "Refunded",
    transactionId: "txn-884205",
    deliveryAddress: "Andheri West, Mumbai",
    rider: "N/A",
    deliveryEta: "Cancelled",
    timeline: [
      { label: "Order Placed", time: "08:44 AM", done: true },
      { label: "Accepted by Kitchen", time: "08:45 AM", done: true },
      { label: "Preparing", time: "08:50 AM", done: true },
      { label: "Cancelled", time: "09:02 AM", done: true },
      { label: "Refund Processed", time: "09:15 AM", done: true }
    ]
  }
];

export const usersSeed: User[] = [
  {
    id: "usr-admin-1",
    name: "Chirag Singh",
    email: "chirag.admin@example.com",
    phone: "+91 98110 11001",
    role: "ADMIN",
    status: "Active",
    createdDate: "2025-07-01",
    addresses: [{ id: "addr-admin-1", label: "HQ", address: "Connaught Place, New Delhi" }],
    orderHistory: []
  },
  {
    id: "usr-riya",
    name: "Riya Mehta",
    email: "riya.m@example.com",
    phone: "+91 98110 22334",
    role: "USER",
    status: "Active",
    createdDate: "2026-01-12",
    addresses: [
      { id: "addr-riya-1", label: "Home", address: "Sector 21, Noida" },
      { id: "addr-riya-2", label: "Office", address: "Cyber City, Gurgaon" }
    ],
    orderHistory: ["CJ-12091"]
  },
  {
    id: "usr-aman",
    name: "Aman Gupta",
    email: "aman.g@example.com",
    phone: "+91 98990 33221",
    role: "USER",
    status: "Active",
    createdDate: "2025-12-03",
    addresses: [{ id: "addr-aman-1", label: "Home", address: "DLF Phase 3, Gurgaon" }],
    orderHistory: ["CJ-12090"]
  },
  {
    id: "usr-sandeep",
    name: "Sandeep Yadav",
    email: "sandeep.y@example.com",
    phone: "+91 97661 88221",
    role: "DELIVERY",
    status: "Active",
    createdDate: "2025-11-18",
    addresses: [{ id: "addr-sandeep-1", label: "Base", address: "Udyog Vihar, Gurgaon" }],
    orderHistory: ["CJ-12090"]
  },
  {
    id: "usr-owner-central",
    name: "Mehul Khanna",
    email: "mehul.k@example.com",
    phone: "+91 98201 11998",
    role: "KITCHEN",
    status: "Inactive",
    createdDate: "2025-09-07",
    addresses: [{ id: "addr-mehul-1", label: "Kitchen", address: "Sector 44, Gurgaon" }],
    orderHistory: ["CJ-12090", "CJ-12088"]
  }
];

export const currentAdminProfile: AdminProfile = {
  id: "usr-admin-1",
  name: "Chirag Singh",
  email: "chirag.admin@example.com",
  phone: "+91 98110 11001",
  role: "ADMIN",
  title: "Platform Operations Admin",
  joinedDate: "2025-07-01",
  bio: "Oversees kitchen onboarding, city operations quality, and dispatch performance across the SaaS workspace.",
  permissions: ["Manage admins", "Create delivery users", "Review restaurant requests", "Publish food items"]
};

export const restaurantsSeed: Restaurant[] = [
  {
    id: "kit-central",
    name: "Central Cloud Kitchen",
    owner: "Mehul Khanna",
    status: "Open",
    type: "active",
    rating: 4.7,
    createdDate: "2025-08-15",
    location: "Sector 44, Gurgaon",
    cuisine: "Burgers & Beverages",
    contactEmail: "central@cloudkitchen.com",
    contactPhone: "+91 98990 22001",
    seats: 0,
    notes: "Top performing flagship kitchen with strong dinner volume.",
    avgPrepTime: "18 mins",
    menuItems: [
      { id: "menu-1", name: "Family Burger Box", price: 999, category: "Burgers" },
      { id: "menu-2", name: "Cold Coffee", price: 121, category: "Beverages" },
      { id: "menu-3", name: "Loaded Fries", price: 190, category: "Snacks" }
    ],
    orderIds: ["CJ-12090"],
    ratingsSummary: { totalReviews: 1820, fiveStar: 1480, fourStar: 260, belowFourStar: 80 }
  },
  {
    id: "kit-north",
    name: "North Hub Kitchen",
    owner: "Priyanka Bedi",
    status: "Open",
    type: "active",
    rating: 4.6,
    createdDate: "2025-10-09",
    location: "Noida Sector 18",
    cuisine: "Wraps & Snacks",
    contactEmail: "northhub@cloudkitchen.com",
    contactPhone: "+91 98990 22002",
    seats: 0,
    notes: "Fast lunch throughput and solid weekday repeat demand.",
    avgPrepTime: "19 mins",
    menuItems: [
      { id: "menu-4", name: "Paneer Tikka Wrap", price: 249, category: "Wraps" },
      { id: "menu-5", name: "Peri Peri Fries", price: 182, category: "Snacks" }
    ],
    orderIds: ["CJ-12091"],
    ratingsSummary: { totalReviews: 1120, fiveStar: 860, fourStar: 190, belowFourStar: 70 }
  },
  {
    id: "kit-east",
    name: "East Quick Kitchen",
    owner: "Ananya Roy",
    status: "Closed",
    type: "closed",
    rating: 4.2,
    createdDate: "2025-12-11",
    location: "Salt Lake, Kolkata",
    cuisine: "Pizza & Drinks",
    contactEmail: "eastquick@cloudkitchen.com",
    contactPhone: "+91 98990 22003",
    seats: 0,
    notes: "Temporarily paused while staffing and dispatch coverage are rebalanced.",
    avgPrepTime: "24 mins",
    menuItems: [
      { id: "menu-6", name: "Loaded Pizza Slice", price: 299, category: "Pizza" },
      { id: "menu-7", name: "Mojito", price: 121, category: "Beverages" }
    ],
    orderIds: ["CJ-12084"],
    ratingsSummary: { totalReviews: 620, fiveStar: 390, fourStar: 160, belowFourStar: 70 }
  },
  {
    id: "kit-request-1",
    name: "Spice Route Kitchen",
    owner: "Rahul Soni",
    status: "Closed",
    type: "requested",
    rating: 0,
    createdDate: "2026-04-16",
    requestDate: "2026-04-16",
    location: "Indiranagar, Bengaluru",
    cuisine: "North Indian Bowls",
    contactEmail: "rahul@spiceroute.in",
    contactPhone: "+91 98118 44001",
    seats: 0,
    notes: "Pending document verification and first menu review.",
    avgPrepTime: "Not available",
    menuItems: [],
    orderIds: [],
    ratingsSummary: { totalReviews: 0, fiveStar: 0, fourStar: 0, belowFourStar: 0 }
  },
  {
    id: "kit-flagged-1",
    name: "Metro Meals Kitchen",
    owner: "Sneha Malhotra",
    status: "FLAGGED",
    type: "flagged",
    rating: 3.8,
    createdDate: "2026-01-21",
    location: "Lajpat Nagar, Delhi",
    cuisine: "Indian Combos",
    contactEmail: "ops@metromeals.in",
    contactPhone: "+91 98118 44002",
    seats: 0,
    notes: "Flagged for SLA variance and repeated cancellation spikes.",
    avgPrepTime: "31 mins",
    menuItems: [
      { id: "menu-8", name: "Rajma Rice Combo", price: 229, category: "Combos" },
      { id: "menu-9", name: "Tandoori Momos", price: 189, category: "Snacks" }
    ],
    orderIds: [],
    ratingsSummary: { totalReviews: 218, fiveStar: 90, fourStar: 74, belowFourStar: 54 }
  }
];

export const categoriesSeed: Category[] = [
  {
    id: "cat-1",
    name: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop",
    createdDate: "2025-11-01",
    description: "Signature burger lineup across veg, chicken, and indulgent premium combos.",
    subcategories: ["Veg Burgers", "Chicken Burgers", "Premium Burgers"]
  },
  {
    id: "cat-2",
    name: "Wraps",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=200&auto=format&fit=crop",
    createdDate: "2025-12-14",
    description: "Fast-moving wraps tailored for lunch and late-night demand.",
    subcategories: ["Paneer Wraps", "Grilled Wraps"]
  },
  {
    id: "cat-3",
    name: "Beverages",
    image: "https://images.unsplash.com/photo-1611928237590-087af6f33f37?w=200&auto=format&fit=crop",
    createdDate: "2026-01-06",
    description: "High-margin drinks built for attach rate and cart expansion.",
    subcategories: ["Cold Coffee", "Soda", "Shakes"]
  }
];

export const foodItemsSeed: FoodItem[] = [
  {
    id: "food-1",
    name: "Family Burger Box",
    category: "Burgers",
    kitchenId: "kit-central",
    kitchenName: "Central Cloud Kitchen",
    price: 999,
    status: "Active",
    foodType: "Non-Veg",
    bestseller: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop",
    description: "Loaded burger combo built for group orders.",
    createdDate: "2025-08-18",
    addons: [
      { id: "addon-1", name: "Cold Coffee", type: "Drink", price: 121 },
      { id: "addon-2", name: "Loaded Fries", type: "Side", price: 190 }
    ]
  },
  {
    id: "food-2",
    name: "Paneer Tikka Wrap",
    category: "Wraps",
    kitchenId: "kit-north",
    kitchenName: "North Hub Kitchen",
    price: 249,
    status: "Active",
    foodType: "Veg",
    bestseller: true,
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&auto=format&fit=crop",
    description: "Fast-moving veg wrap with strong lunch demand.",
    createdDate: "2025-10-10",
    addons: [
      { id: "addon-3", name: "Mint Mojito", type: "Drink", price: 99 },
      { id: "addon-4", name: "Peri Peri Fries", type: "Side", price: 182 }
    ]
  },
  {
    id: "food-3",
    name: "Rajma Rice Combo",
    category: "Combos",
    kitchenId: "kit-flagged-1",
    kitchenName: "Metro Meals Kitchen",
    price: 229,
    status: "Inactive",
    foodType: "Veg",
    bestseller: false,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&auto=format&fit=crop",
    description: "Hearty combo paused pending menu refresh.",
    createdDate: "2026-01-25",
    addons: [{ id: "addon-5", name: "Masala Soda", type: "Drink", price: 79 }]
  },
  {
    id: "food-4",
    name: "Tandoori Momos",
    category: "Snacks",
    kitchenId: "kit-flagged-1",
    kitchenName: "Metro Meals Kitchen",
    price: 189,
    status: "Active",
    foodType: "Non-Veg",
    bestseller: false,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop",
    description: "Popular evening snack with smoky finish.",
    createdDate: "2026-01-26",
    addons: [
      { id: "addon-6", name: "Schezwan Dip", type: "Dip", price: 30 },
      { id: "addon-7", name: "Lime Soda", type: "Drink", price: 89 }
    ]
  }
];

export const addonsSeed = [
  { id: "addon-1", name: "Extra Cheese", price: 50, type: "Topping", status: "Active" },
  { id: "addon-2", name: "Cold Coffee", price: 121, type: "Drink", status: "Active" },
  { id: "addon-3", name: "Loaded Fries", price: 190, type: "Side", status: "Active" },
  { id: "addon-4", name: "Mint Mojito", price: 99, type: "Drink", status: "Active" },
  { id: "addon-5", name: "Peri Peri Fries", price: 182, type: "Side", status: "Active" },
  { id: "addon-6", name: "Masala Soda", price: 79, type: "Drink", status: "Active" },
  { id: "addon-7", name: "Schezwan Dip", price: 30, type: "Dip", status: "Active" },
  { id: "addon-8", name: "Lime Soda", price: 89, type: "Drink", status: "Active" },
  { id: "addon-9", name: "Garlic Mayo", price: 20, type: "Dip", status: "Active" },
  { id: "addon-10", name: "Coke", price: 40, type: "Drink", status: "Active" },
];

export const sidebarNavigation: NavigationItem[] = [
  { title: "Overview", href: "/overview", icon: "overview" },
  {
    title: "Orders",
    href: "/orders",
    icon: "orders",
    children: [
      { title: "All Orders", href: "/orders" },
      { title: "Completed", href: "/orders?status=completed" },
      { title: "Unassigned", href: "/orders?status=unassigned" },
      { title: "Preparing", href: "/orders?status=preparing" },
      { title: "Out for Delivery", href: "/orders?status=out-for-delivery" },
      { title: "Cancelled", href: "/orders?status=cancelled" }
    ]
  },
  {
    title: "Users",
    href: "/users",
    icon: "users",
    children: [
      { title: "All Users", href: "/users" },
      { title: "Admins", href: "/users?role=admin" },
      { title: "Delivery", href: "/users?role=delivery" },
      { title: "Kitchen", href: "/users?role=kitchen" },
      { title: "Customers", href: "/users?role=user" }
    ]
  },
  {
    title: "Restaurants",
    href: "/restaurants",
    icon: "restaurants",
    children: [
      { title: "All Partners", href: "/restaurants" },
      { title: "Requested", href: "/restaurants?status=REQUESTED" },
      { title: "Active", href: "/restaurants?status=ACTIVE" },
      { title: "Closed", href: "/restaurants?status=CLOSED" },
      { title: "Flagged", href: "/restaurants?status=FLAGGED" }
    ]
  },
  {
    title: "Food Items",

    href: "/food-items",
    icon: "food-items",
    children: [
      { title: "All Items", href: "/food-items" },
      { title: "Veg", href: "/food-items?type=veg" },
      { title: "Non-Veg", href: "/food-items?type=non-veg" },
      { title: "Bestsellers", href: "/food-items?type=bestsellers" }
    ]
  },
  { title: "Categories", href: "/categories", icon: "categories" },
  { title: "Add-ons", href: "/addons", icon: "addons" },
  { title: "Payments", href: "/payments", icon: "payments" },
  {
    title: "Analytics",
    href: "/analytics",
    icon: "analytics",
    children: [
      { title: "Sales Overview", href: "/analytics/sales" },
      { title: "Revenue Deepdive", href: "/analytics/revenue" },
      { title: "Performance", href: "/analytics/performance" }
    ]
  },
  {
    title: "Delivery",
    href: "/delivery",
    icon: "delivery",
    children: [
      { title: "Agents", href: "/delivery/agents" },
      { title: "Payouts", href: "/delivery/payouts" },
      { title: "Tracking", href: "/delivery/tracking" }
    ]
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: "marketing",
    children: [
      { title: "Coupons", href: "/marketing/coupons" },
      { title: "Banner Ads", href: "/marketing/banners" },
      { title: "Loyalty Points", href: "/marketing/loyalty" }
    ]
  },
  {
    title: "Support",
    href: "/support",
    icon: "support",
    children: [
      { title: "Tickets", href: "/support/tickets" },
      { title: "Reviews", href: "/support/reviews" }
    ]
  },
  { title: "Inventory", href: "/inventory", icon: "inventory" },
  {
    title: "System",
    href: "/system",
    icon: "system",
    children: [
      { title: "Audit Logs", href: "/system/logs" },
      { title: "Notifications", href: "/system/notifications" },
      { title: "Cloud Media", href: "/system/media" },
      { title: "Service Zones", href: "/system/zones" },
      { title: "App Config", href: "/system/config" }
    ]
  },
  { title: "Settings", href: "/settings", icon: "settings" },
  { title: "Profile", href: "/profile", icon: "profile" }
];

export const findOrder = (orderId: string) => allOrders.find((order) => order.id === orderId);
export const findUser = (userId: string) => usersSeed.find((user) => user.id === userId);
export const findRestaurant = (restaurantId: string) => restaurantsSeed.find((restaurant) => restaurant.id === restaurantId);
export const findCategory = (categoryId: string) => categoriesSeed.find((category) => category.id === categoryId);
