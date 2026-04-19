"use client";

import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Tags,
  UserCircle2,
  Users,
  UtensilsCrossed,
  Truck,
  TrendingUp,
  Megaphone,
  Headphones,
  Server,
  Activity,
  Award,
  CircleCheck,
  HardHat,
  HeartHandshake
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarNavigation } from "@/data/dashboard-data";

const iconMap = {
  overview: LayoutDashboard,
  orders: Package,
  users: Users,
  restaurants: Store,
  "food-items": UtensilsCrossed,
  categories: Tags,
  payments: CreditCard,
  settings: Settings,
  profile: UserCircle2,
  addons: Tags,
  analytics: TrendingUp,
  delivery: Truck,
  marketing: Megaphone,
  support: Headphones,
  inventory: Package,
  system: Server
};

type SidebarNavProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const currentPath = location.pathname + location.search;
  const initialOpenState = useMemo(
    () =>
      Object.fromEntries(
        sidebarNavigation
          .filter((item) => item.children?.length)
          .map((item) => [
            item.title,
            item.children?.some((child) => currentPath === child.href) ||
              pathname.startsWith(item.href)
          ])
      ),
    [currentPath, pathname]
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpenState);

  return (
    <nav className="flex flex-col gap-1">
      {sidebarNavigation.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const active =
          pathname === item.href ||
          (item.href === "/orders" && pathname.startsWith("/orders")) ||
          (item.href === "/restaurants" && pathname.startsWith("/restaurants")) ||
          (item.href === "/users" && pathname.startsWith("/users")) ||
          (item.href === "/food-items" && pathname.startsWith("/food-items"));
        const isOpen = openGroups[item.title] ?? active;

        return (
          <div key={item.title} className="flex flex-col gap-1">
            {item.children && !collapsed ? (
              <div className="flex flex-col gap-1">
                <div
                  className={cn(
                    "group flex items-center rounded-2xl transition",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent"
                  )}
                >
                  <Link
                    to={item.href}
                    onClick={onNavigate}
                    className="flex flex-1 items-center gap-3 px-3 py-2.5 text-sm font-medium"
                  >
                    <Icon className="shrink-0 size-5" />
                    <span className="flex-1 text-left">{item.title}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenGroups((current) => ({
                        ...current,
                        [item.title]: !isOpen
                      }));
                    }}
                    className={cn(
                      "p-2 mr-1 rounded-xl transition",
                      active ? "hover:bg-white/10" : "hover:bg-black/5"
                    )}
                  >
                    {isOpen ? <ChevronDown className="size-4 shrink-0 opacity-60" /> : <ChevronRight className="size-4 shrink-0 opacity-60" />}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className="shrink-0" />
                {!collapsed ? <span>{item.title}</span> : null}
              </Link>
            )}

            {!collapsed && item.children && isOpen ? (
              <div className="ml-4 flex flex-col gap-1 border-l border-sidebar-border pl-4">
                {item.children.map((child) => {
                  const childActive = currentPath === child.href;
                  return (
                    <Link
                      key={child.href}
                      to={child.href}
                      onClick={onNavigate}
                      className={cn(
                        "rounded-xl px-3 py-2 text-xs text-muted-foreground transition hover:bg-sidebar-accent/70 hover:text-foreground",
                        childActive && "bg-background text-foreground shadow-sm"
                      )}
                    >
                      {child.title}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
