export type DateRange = "1d" | "1m" | "3m" | "12m" | "lifetime";

export type OrderStatus =
  | "Completed"
  | "Unassigned"
  | "Out for Delivery"
  | "Preparing"
  | "Cancelled";

export type OrdersSubView =
  | "all"
  | "completed"
  | "unassigned"
  | "out-for-delivery"
  | "preparing"
  | "cancelled";

export type RestaurantsSubView = "all" | "requested" | "active" | "closed" | "flagged";
export type UsersSubView = "all" | "admin" | "delivery" | "kitchen" | "user";
export type FoodItemsSubView = "all" | "veg" | "non-veg" | "bestsellers";

export type DashboardView =
  | "overview"
  | "orders"
  | "users"
  | "restaurants"
  | "food-items"
  | "categories"
  | "payments"
  | "settings"
  | "profile";

export type UserRole = "ADMIN" | "USER" | "DELIVERY" | "KITCHEN";
export type UserStatus = "Active" | "Inactive";
export type KitchenStatus = "Open" | "Closed";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";
export type FoodType = "Veg" | "Non-Veg";
export type FoodAddonType = "Drink" | "Side" | "Dip" | "Dessert" | "Extra";

export type StatsCard = {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
};

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

export type OrderTimelineStep = {
  label: string;
  time: string;
  done: boolean;
};

export type OrderRow = {
  id: string;
  customerId: string;
  customerName: string;
  kitchenId: string;
  kitchenName: string;
  status: OrderStatus;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId: string;
  deliveryAddress: string;
  rider: string;
  deliveryEta: string;
  timeline: OrderTimelineStep[];
};

export type Address = {
  id: string;
  label: string;
  address: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdDate: string;
  addresses: Address[];
  orderHistory: string[];
};

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN";
  title: string;
  joinedDate: string;
  bio: string;
  permissions: string[];
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export type Restaurant = {
  id: string;
  name: string;
  owner: string;
  status: KitchenStatus;
  type: RestaurantsSubView;
  rating: number;
  createdDate: string;
  location: string;
  cuisine: string;
  contactEmail: string;
  contactPhone: string;
  seats?: number;
  requestDate?: string;
  notes?: string;
  avgPrepTime: string;
  menuItems: MenuItem[];
  orderIds: string[];
  ratingsSummary: {
    totalReviews: number;
    fiveStar: number;
    fourStar: number;
    belowFourStar: number;
  };
};

export type FoodItem = {
  id: string;
  name: string;
  category: string;
  kitchenId: string;
  kitchenName: string;
  price: number;
  status: "Active" | "Inactive";
  foodType: FoodType;
  bestseller: boolean;
  image: string;
  description: string;
  createdDate: string;
  addons: Array<{
    id: string;
    name: string;
    type: FoodAddonType;
    price: number;
  }>;
};

export type Category = {
  id: string;
  name: string;
  image: string;
  createdDate: string;
  description?: string;
  subcategories: string[];
};

export type NavigationItem = {
  title: string;
  href: string;
  icon: string;
  children?: Array<{
    title: string;
    href: string;
  }>;
};
