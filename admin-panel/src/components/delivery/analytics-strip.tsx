"use client";

import type { DeliveryPartner } from "@/types";
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle2, XCircle, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type AnalyticsStripProps = {
  partners: DeliveryPartner[];
};

export function AnalyticsStrip({ partners }: AnalyticsStripProps) {
  const stats = {
    total: partners.length,
    approved: partners.filter((p) => p.status === "approved").length,
    pending: partners.filter((p) => p.status === "pending").length,
    rejected: partners.filter((p) => p.status === "rejected").length,
    blocked: partners.filter((p) => p.status === "blocked").length,
    active: partners.filter((p) => p.status === "approved").length,
    avgRating: 4.2,
    approvalRate: partners.length > 0 ? Math.round((partners.filter((p) => p.status === "approved").length / partners.length) * 100) : 0,
  };

  const analyticsItems = [
    {
      label: "Total Partners",
      value: stats.total,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
      trend: null,
    },
    {
      label: "Active Now",
      value: stats.active,
      icon: Zap,
      color: "bg-emerald-50 text-emerald-700",
      trend: null,
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "bg-amber-50 text-amber-700",
      trend: stats.pending > 0 ? "up" : null,
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
      trend: null,
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "bg-rose-50 text-rose-700",
      trend: null,
    },
    {
      label: "Suspended",
      value: stats.blocked,
      icon: AlertCircle,
      color: "bg-red-50 text-red-700",
      trend: stats.blocked > 0 ? "warning" : null,
    },
    {
      label: "Approval Rate",
      value: `${stats.approvalRate}%`,
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-700",
      trend: stats.approvalRate >= 80 ? "up" : "down",
    },
  ];

  return (
    <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-6 overflow-x-auto bg-linear-to-b from-background via-background to-background/80 px-6 pt-6 pb-3">
      <div className="flex gap-2 pb-2">
        {analyticsItems.map((item, idx) => {
          const Icon = item.icon;
          const trendIcon =
            item.trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-emerald-600" />
            ) : item.trend === "down" ? (
              <TrendingDown className="h-3 w-3 text-rose-600" />
            ) : item.trend === "warning" ? (
              <AlertCircle className="h-3 w-3 text-red-600" />
            ) : null;

          return (
            <div
              key={idx}
              className={cn(
                "flex flex-col gap-1 rounded-lg px-3 py-2 text-xs whitespace-nowrap transition-all hover:shadow-md hover:scale-105",
                item.color,
                "bg-opacity-50 border border-current border-opacity-20"
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="opacity-80">{item.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5 font-bold text-sm">
                {item.value}
                {trendIcon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
