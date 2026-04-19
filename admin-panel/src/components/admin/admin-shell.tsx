"use client";

import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { Topbar } from "@/components/admin/topbar";
import { cn } from "@/lib/utils";

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  "/overview": {
    title: "Overview Dashboard",
    subtitle: "Track performance, growth, and operational health across the kitchen network."
  },
  "/orders": {
    title: "Orders",
    subtitle: "Monitor the full order funnel, filter queues, and jump into order-level details."
  },
  "/users": {
    title: "Users",
    subtitle: "Manage customers, delivery partners, and kitchen accounts from one workspace."
  },
  "/restaurants": {
    title: "Restaurants",
    subtitle: "Inspect kitchen operations, menu coverage, and rating trends."
  },
  "/food-items": {
    title: "Food Items",
    subtitle: "Manage catalog items, filter by type, and add new menu inventory cleanly."
  },
  "/categories": {
    title: "Categories",
    subtitle: "Control category structure, image quality, and subcategory taxonomy."
  },
  "/payments": {
    title: "Payments",
    subtitle: "Watch settlement health and refund activity with finance-friendly summaries."
  },
  "/settings": {
    title: "Settings",
    subtitle: "Adjust workspace defaults, notifications, and visibility preferences."
  },
  "/profile": {
    title: "Profile",
    subtitle: "View the current admin profile, permissions, and workspace access scope."
  },
  "/addons": {
    title: "Food Add-ons",
    subtitle: "Manage extra toppings, sides, and beverages for your food items."
  },
  "/analytics/sales": {
    title: "Sales Analytics",
    subtitle: "Deep dive into platform sales performance and conversion trends."
  },
  "/analytics/revenue": {
    title: "Revenue Deepdive",
    subtitle: "Track platform earnings, commission splits, and financial health."
  },
  "/analytics/performance": {
    title: "Performance Metrics",
    subtitle: "Analyze kitchen efficiency, delivery SLAs, and customer satisfaction."
  },
  "/delivery/agents": {
    title: "Delivery Partners",
    subtitle: "Monitor and manage your fleet of active delivery agents."
  },
  "/delivery/payouts": {
    title: "Partner Payouts",
    subtitle: "Manage delivery partner earnings and settlement processing."
  },
  "/delivery/tracking": {
    title: "Live Tracking",
    subtitle: "Real-time GPS monitoring of active delivery orders on the field."
  },
  "/marketing/coupons": {
    title: "Promo Collections",
    subtitle: "Manage discount coupons, flash sales, and promotional offers."
  },
  "/marketing/banners": {
    title: "Banner Campaigns",
    subtitle: "Update home screen sliders and tactical marketing placements."
  },
  "/marketing/loyalty": {
    title: "Loyalty Program",
    subtitle: "Configure customer points, referral bonuses, and tier rewards."
  },
  "/support/tickets": {
    title: "Support Tickets",
    subtitle: "Track and resolve customer queries and operational complaints."
  },
  "/support/reviews": {
    title: "Order Reviews",
    subtitle: "Monitor customer feedback and kitchen quality scores."
  },
  "/inventory": {
    title: "Inventory Control",
    subtitle: "Global stock management and low-inventory alerts for kitchens."
  },
  "/system/logs": {
    title: "Audit Logs",
    subtitle: "Complete trail of administrative changes and system events."
  },
  "/system/notifications": {
    title: "System Alerts",
    subtitle: "Broadcast push notifications and SMS updates to users."
  },
  "/system/zones": {
    title: "Service Zones",
    subtitle: "Manage delivery polygons and geofenced operational areas."
  },
  "/system/config": {
    title: "App Configuration",
    subtitle: "Main system parameters, feature flags, and global constants."
  },
  "/payout-requests": {
    title: "Withdrawal Requests",
    subtitle: "Review and approve restaurant partner payout withdrawals."
  },
  "/staff": {
    title: "Staff Management",
    subtitle: "Internal team access control, roles, and administrative permissions."
  },
  "/tax-settings": {
    title: "Tax & Compliance",
    subtitle: "Configure GST, service charges, and platform commission rates."
  },
  "/maintenance": {
    title: "Maintenance Mode",
    subtitle: "Control platform accessibility during scheduled system updates."
  }
};

export function AdminShell({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const meta = useMemo(() => {
    const matchedKey = Object.keys(routeMeta).find((key) => pathname.startsWith(key));
    return matchedKey ? routeMeta[matchedKey] : routeMeta["/overview"];
  }, [pathname]);

  return (
    <main className="min-h-screen text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 border-r bg-sidebar/95 p-4 shadow-xl backdrop-blur transition-all duration-300 md:static md:shadow-none",
            collapsed ? "w-24" : "w-[300px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className={cn("mb-6 flex flex-col gap-3", collapsed && "items-center")}>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="inline-flex size-2 rounded-full bg-primary" />
              {!collapsed ? "Cloud Kitchen SaaS" : null}
            </div>
            {!collapsed ? (
              <div>
                <h2 className="text-xl font-semibold">Chatori Jeep</h2>
                <p className="text-sm text-muted-foreground">Admin control center</p>
              </div>
            ) : null}
          </div>

          <SidebarNav collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-20 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            title={meta.title}
            subtitle={meta.subtitle}
            collapsed={collapsed}
            onToggleSidebar={() => setMobileOpen((value) => !value)}
            onToggleCollapse={() => setCollapsed((value) => !value)}
          />
          <section className="p-4 md:p-6">{children ?? <Outlet />}</section>
        </div>
      </div>
    </main>
  );
}
