import { useEffect, useState } from "react";
import { CalendarRange } from "lucide-react";
import { OverviewCharts } from "@/components/admin/overview-charts";
import { StatsGrid } from "@/components/admin/stats-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { statsCards } from "@/data/dashboard-data";
import type { DateRange } from "@/types/dashboard";

const dateFilters: Array<{ key: DateRange; label: string }> = [
  { key: "1d", label: "1 Day" },
  { key: "1m", label: "1 Month" },
  { key: "3m", label: "3 Months" },
  { key: "12m", label: "12 Months" },
  { key: "lifetime", label: "Lifetime" }
];

export function OverviewPage() {
  const [dateRange, setDateRange] = useState<DateRange>("1m");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Business Snapshot</CardTitle>
            <CardDescription>Read the kitchen network at a glance and pivot ranges without leaving the page.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
              Filter Range
            </Badge>
            {dateFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setDateRange(filter.key)}
                className={`rounded-xl px-3 py-1.5 text-sm transition ${
                  dateRange === filter.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </CardHeader>
      </Card>

      <StatsGrid data={statsCards} />
      <OverviewCharts />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Operations Health</CardTitle>
            <CardDescription>Kitchen throughput, queue pressure, and dispatch balance.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">Orders awaiting assignment</span>
              <span className="font-semibold">14</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">Kitchens below SLA</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">Refunds in progress</span>
              <span className="font-semibold">6</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Operator Notes</CardTitle>
            <CardDescription>Dummy operational insight blocks showing how reusable cards scale across modules.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              ["Lunch spike", "North Hub Kitchen is pacing 12% above the prior weekday trend."],
              ["Rider shortage", "Two zones in Gurgaon are trending high on unassigned orders."],
              ["Menu attach rate", "Beverages are outperforming baseline by 9.2% this week."]
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border bg-background/60 p-4">
                <p className="font-medium">{title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
