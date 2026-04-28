import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FoodType, RestaurantStatus, OrderStatus, PaymentStatus, UserRole, UserStatus } from "@/types/dashboard";

type StatusValue = OrderStatus | PaymentStatus | UserStatus | RestaurantStatus | UserRole | FoodType | string;

const statusStyles: Record<string, string> = {
  // Restaurant Statuses
  REQUESTED: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  REJECTED: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
  FLAGGED: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100",
  
  // Order Statuses
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  Preparing: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
  Cancelled: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  "Out for Delivery": "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
  Unassigned: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",

  // User Roles
  ADMIN: "bg-indigo-600 text-white border-transparent hover:bg-indigo-600",
  admin: "bg-indigo-600 text-white border-transparent hover:bg-indigo-600",
  KITCHEN: "bg-amber-600 text-white border-transparent hover:bg-amber-600",
  kitchen: "bg-amber-600 text-white border-transparent hover:bg-amber-600",
  DELIVERY: "bg-slate-600 text-white border-transparent hover:bg-slate-600",
  delivery: "bg-slate-600 text-white border-transparent hover:bg-slate-600",
  USER: "bg-emerald-600 text-white border-transparent hover:bg-emerald-600",
  user: "bg-emerald-600 text-white border-transparent hover:bg-emerald-600",

  // Others
  Active: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50",
  active: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50",
  Inactive: "bg-red-50 text-red-600 border-red-100 hover:bg-red-50",
  INACTIVE: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  inactive: "bg-red-50 text-red-600 border-red-100 hover:bg-red-50",
};

export function StatusBadge({ value, className }: { value: StatusValue; className?: string }) {
  const style = statusStyles[value as string] || "bg-secondary text-secondary-foreground";
  return (
    <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider", style, className)}>
      {value}
    </Badge>
  );
}
