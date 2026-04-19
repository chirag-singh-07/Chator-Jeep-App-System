import { Badge } from "@/components/ui/badge";
import type { FoodType, KitchenStatus, OrderStatus, PaymentStatus, UserRole, UserStatus } from "@/types/dashboard";

type StatusValue = OrderStatus | PaymentStatus | UserStatus | KitchenStatus | UserRole | FoodType;

const outlineValues = new Set<StatusValue>(["Cancelled", "Pending", "Inactive", "Closed"]);
const secondaryValues = new Set<StatusValue>(["Completed", "Paid", "Open", "USER", "ADMIN", "Veg"]);

export function StatusBadge({ value }: { value: StatusValue }) {
  const variant = outlineValues.has(value) ? "outline" : secondaryValues.has(value) ? "secondary" : "default";
  return <Badge variant={variant}>{value}</Badge>;
}
