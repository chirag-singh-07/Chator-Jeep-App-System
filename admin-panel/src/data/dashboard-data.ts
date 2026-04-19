import type { Category, OrderRow, StatsCard } from "@/types/dashboard";

export const statsCards: StatsCard[] = [
  { title: "Total Orders", value: "12,480", trend: "+8.4% vs last period", trendUp: true },
  { title: "Revenue", value: "Rs 24.8L", trend: "+11.2% vs last period", trendUp: true },
  { title: "Active Kitchens", value: "34", trend: "+2 new kitchens", trendUp: true },
  { title: "Delivery Partners", value: "128", trend: "-1.8% active today", trendUp: false },
  { title: "Avg Prep Time", value: "19 min", trend: "-6.2% faster", trendUp: true },
  { title: "Cancellation Rate", value: "2.1%", trend: "-0.4% improvement", trendUp: true }
];

export const ordersBarData = [
  { label: "Mon", orders: 820 },
  { label: "Tue", orders: 930 },
  { label: "Wed", orders: 880 },
  { label: "Thu", orders: 1020 },
  { label: "Fri", orders: 1210 },
  { label: "Sat", orders: 1340 },
  { label: "Sun", orders: 1180 }
];

export const revenueLineData = [
  { label: "W1", revenue: 3.6 },
  { label: "W2", revenue: 4.1 },
  { label: "W3", revenue: 4.5 },
  { label: "W4", revenue: 5.2 },
  { label: "W5", revenue: 4.8 },
  { label: "W6", revenue: 5.6 },
  { label: "W7", revenue: 5.9 }
];

export const statusPieData = [
  { name: "Completed", value: 62 },
  { name: "Preparing", value: 16 },
  { name: "Out for Delivery", value: 12 },
  { name: "Unassigned", value: 6 },
  { name: "Cancelled", value: 4 }
];

export const allOrders: OrderRow[] = [
  {
    id: "CJ-12091",
    user: "Riya Mehta",
    kitchen: "North Hub Kitchen",
    status: "Preparing",
    amount: 680,
    date: "2026-04-19 12:10",
    items: [
      { name: "Paneer Tikka Wrap", qty: 2, price: 249 },
      { name: "Peri Peri Fries", qty: 1, price: 182 }
    ],
    deliveryAddress: "Sector 21, Noida",
    rider: "Not assigned",
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
    user: "Aman Gupta",
    kitchen: "Central Cloud Kitchen",
    status: "Out for Delivery",
    amount: 1240,
    date: "2026-04-19 11:48",
    items: [
      { name: "Family Burger Box", qty: 1, price: 999 },
      { name: "Cold Coffee", qty: 2, price: 121 }
    ],
    deliveryAddress: "DLF Phase 3, Gurgaon",
    rider: "Sandeep Yadav",
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
    user: "Nikhil Rao",
    kitchen: "South Hub Kitchen",
    status: "Completed",
    amount: 460,
    date: "2026-04-19 10:25",
    items: [
      { name: "Makhani Bowl", qty: 1, price: 299 },
      { name: "Masala Soda", qty: 1, price: 161 }
    ],
    deliveryAddress: "Koramangala 5th Block, Bengaluru",
    rider: "Rakesh P",
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
    user: "Muskan Arora",
    kitchen: "East Quick Kitchen",
    status: "Unassigned",
    amount: 840,
    date: "2026-04-19 09:58",
    items: [
      { name: "Loaded Pizza Slice", qty: 2, price: 299 },
      { name: "Mojito", qty: 2, price: 121 }
    ],
    deliveryAddress: "Salt Lake, Kolkata",
    rider: "Not assigned",
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
    user: "Dev Sharma",
    kitchen: "West Cloud Kitchen",
    status: "Cancelled",
    amount: 350,
    date: "2026-04-19 08:44",
    items: [{ name: "Combo Roll Box", qty: 1, price: 350 }],
    deliveryAddress: "Andheri West, Mumbai",
    rider: "N/A",
    timeline: [
      { label: "Order Placed", time: "08:44 AM", done: true },
      { label: "Accepted by Kitchen", time: "08:45 AM", done: true },
      { label: "Preparing", time: "08:50 AM", done: true },
      { label: "Cancelled", time: "09:02 AM", done: true },
      { label: "Refund Processed", time: "09:15 AM", done: true }
    ]
  }
];

export const categoriesSeed: Category[] = [
  {
    id: "cat-1",
    name: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop",
    createdDate: "2025-11-01",
    subcategories: ["Veg Burgers", "Chicken Burgers", "Premium Burgers"]
  },
  {
    id: "cat-2",
    name: "Wraps",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=200&auto=format&fit=crop",
    createdDate: "2025-12-14",
    subcategories: ["Paneer Wraps", "Grilled Wraps"]
  },
  {
    id: "cat-3",
    name: "Beverages",
    image: "https://images.unsplash.com/photo-1611928237590-087af6f33f37?w=200&auto=format&fit=crop",
    createdDate: "2026-01-06",
    subcategories: ["Cold Coffee", "Soda", "Shakes"]
  }
];
