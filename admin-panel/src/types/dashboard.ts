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

export type DashboardView = "overview" | "orders" | "categories";

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

export type OrderRow = {
  id: string;
  user: string;
  kitchen: string;
  status: OrderStatus;
  amount: number;
  date: string;
  items: OrderItem[];
  deliveryAddress: string;
  rider: string;
  timeline: Array<{ label: string; time: string; done: boolean }>;
};

export type Category = {
  id: string;
  name: string;
  image: string;
  createdDate: string;
  subcategories: string[];
};
