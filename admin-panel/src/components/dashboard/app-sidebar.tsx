import {
  ChevronDown,
  ChevronRight,
  Grid2x2,
  LayoutDashboard,
  Package,
  Tags
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardView, OrdersSubView } from "@/types/dashboard";

type Props = {
  open: boolean;
  collapsed: boolean;
  activeView: DashboardView;
  activeOrdersView: OrdersSubView;
  ordersOpen: boolean;
  setOrdersOpen: (open: boolean) => void;
  onViewChange: (view: DashboardView) => void;
  onOrdersViewChange: (view: OrdersSubView) => void;
  onCloseMobile: () => void;
};

const ordersItems: Array<{ key: OrdersSubView; label: string }> = [
  { key: "all", label: "All Orders" },
  { key: "completed", label: "Completed Orders" },
  { key: "unassigned", label: "Unassigned Orders" },
  { key: "out-for-delivery", label: "Out for Delivery" },
  { key: "preparing", label: "Preparing Orders" },
  { key: "cancelled", label: "Cancelled Orders" }
];

export function AppSidebar({
  open,
  collapsed,
  activeView,
  activeOrdersView,
  ordersOpen,
  setOrdersOpen,
  onViewChange,
  onOrdersViewChange,
  onCloseMobile
}: Props) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 border-r bg-card px-3 py-4 shadow-xl transition-all duration-300 md:static md:shadow-none",
        collapsed ? "w-[86px]" : "w-[280px]",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className={cn("mb-6 px-2", collapsed && "px-0 text-center")}>
        <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          <Grid2x2 className="h-3.5 w-3.5" />
          {!collapsed ? "Cloud Kitchen Admin" : null}
        </div>
        {!collapsed ? <h1 className="mt-3 text-xl font-semibold">Chatori Jeep</h1> : null}
      </div>

      <nav className="space-y-1">
        <button
          type="button"
          onClick={() => {
            onViewChange("overview");
            onCloseMobile();
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
            activeView === "overview" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          {!collapsed ? "Overview" : null}
        </button>

        <div>
          <button
            type="button"
            onClick={() => setOrdersOpen(!ordersOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              activeView === "orders" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <Package className="h-4 w-4" />
            {!collapsed ? (
              <>
                <span className="flex-1 text-left">Orders</span>
                {ordersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </>
            ) : null}
          </button>
          {!collapsed && ordersOpen ? (
            <div className="mt-1 space-y-1 pl-9">
              {ordersItems.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => {
                    onViewChange("orders");
                    onOrdersViewChange(item.key);
                    onCloseMobile();
                  }}
                  className={cn(
                    "block w-full rounded-lg px-2 py-1.5 text-left text-xs transition",
                    activeView === "orders" && activeOrdersView === item.key
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            onViewChange("categories");
            onCloseMobile();
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
            activeView === "categories" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          )}
        >
          <Tags className="h-4 w-4" />
          {!collapsed ? "Categories" : null}
        </button>
      </nav>
    </aside>
  );
}
