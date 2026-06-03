"use client";

import type { DeliveryPartner } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusFilterTabsProps = {
  partners: DeliveryPartner[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function StatusFilterTabs({
  partners,
  activeTab,
  onTabChange,
}: StatusFilterTabsProps) {
  const tabs = [
    {
      value: "all",
      label: "All Partners",
      count: partners.length,
      icon: null,
      color: "default",
    },
    {
      value: "pending",
      label: "Pending Review",
      count: partners.filter((p) => p.status === "pending").length,
      icon: Clock,
      color: "warning",
    },
    {
      value: "approved",
      label: "Approved",
      count: partners.filter((p) => p.status === "approved").length,
      icon: CheckCircle2,
      color: "success",
    },
    {
      value: "rejected",
      label: "Rejected",
      count: partners.filter((p) => p.status === "rejected").length,
      icon: XCircle,
      color: "destructive",
    },
    {
      value: "blocked",
      label: "Suspended",
      count: partners.filter((p) => p.status === "blocked").length,
      icon: AlertCircle,
      color: "destructive",
    },
    {
      value: "high-risk",
      label: "High Risk",
      count: partners.filter((p) => p.status === "blocked" || p.status === "rejected").length,
      icon: AlertCircle,
      color: "destructive",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;

        return (
          <Button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "rounded-full px-4 py-2 h-auto transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60 border border-muted/30"
            )}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              <span className="text-sm font-medium">{tab.label}</span>
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className={cn(
                  "ml-1 rounded-full h-6 w-6 flex items-center justify-center p-0",
                  isActive && "bg-white/20"
                )}
              >
                {tab.count}
              </Badge>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
