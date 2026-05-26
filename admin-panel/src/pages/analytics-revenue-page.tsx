"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { TrendingUp, TrendingDown, Download, Loader2, IndianRupee, Building2, Percent, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin.service";
import { formatCurrency } from "@/lib/format";

const dateFilters = [
  { key: "1d", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "1m", label: "30 Days" },
  { key: "3m", label: "3 Months" },
  { key: "12m", label: "1 Year" },
];

type RevenueAnalytics = {
  totalRevenue: number;
  totalFoodAmount: number;
  totalDeliveryFee: number;
  totalPlatformFee: number;
  totalCommission: number;
  netPlatformEarnings: number;
  chartData: Array<{
    label: string;
    date: string;
    revenue: number;
    foodAmount: number;
    deliveryFee: number;
    platformFee: number;
    commissionAmount: number;
  }>;
  topRestaurants: Array<{ name: string; revenue: number }>;
  period: { startDate: string; endDate: string };
};

export function AnalyticsRevenuePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [range, setRange] = useState("1m");

  useEffect(() => {
    setLoading(true);
    adminService.getAnalyticsRevenue({ range })
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  const formatRevenue = (value: number) => {
    if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}k`;
    return `Rs ${value}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">Detailed revenue breakdown and platform earnings</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border bg-card p-1">
            {dateFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={range === filter.key ? "default" : "ghost"}
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => setRange(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-3xl">
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3">
                  <IndianRupee className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Revenue</p>
                  <h2 className="text-2xl font-bold">{formatRevenue(data?.totalRevenue || 0)}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Food Amount</p>
                  <h2 className="text-2xl font-bold">{formatRevenue(data?.totalFoodAmount || 0)}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3">
                  <Truck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Delivery Fees</p>
                  <h2 className="text-2xl font-bold">{formatRevenue(data?.totalDeliveryFee || 0)}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && data && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-purple-100 p-3">
                  <Percent className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Platform Fees</p>
                  <h2 className="text-2xl font-bold">{formatRevenue(data.totalPlatformFee)}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-100 p-3">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Commission</p>
                  <h2 className="text-2xl font-bold">{formatRevenue(data.totalCommission)}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-100 p-3">
                  <IndianRupee className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Net Platform Earnings</p>
                  <h2 className="text-2xl font-bold">{formatRevenue(data.netPlatformEarnings)}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm p-2">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Platform fees and commissions over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={data?.chartData || []}>
                    <defs>
                      <linearGradient id="colorPlatformFee" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} tickFormatter={(v) => `Rs ${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="platformFee" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPlatformFee)" strokeWidth={2} name="Platform Fee" />
                    <Area type="monotone" dataKey="commissionAmount" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCommission)" strokeWidth={2} name="Commission" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm p-2">
          <CardHeader>
            <CardTitle>Revenue Composition</CardTitle>
            <CardDescription>Food vs delivery fees breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={data?.chartData?.slice(-7) || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} tickFormatter={(v) => `Rs ${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="foodAmount" fill="#22c55e" radius={[4, 4, 0, 0]} name="Food Amount" />
                    <Bar dataKey="deliveryFee" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Delivery Fee" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Restaurants by Revenue</CardTitle>
            <CardDescription>Best performing restaurant partners</CardDescription>
          </div>
          <Button variant="ghost" className="rounded-xl">View All</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : data?.topRestaurants && data.topRestaurants.length > 0 ? (
            <div className="space-y-4">
              {data.topRestaurants.map((restaurant, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="font-bold">{restaurant.name}</p>
                      <p className="text-xs text-muted-foreground">Restaurant Partner</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(restaurant.revenue)}</p>
                    <p className="text-xs text-emerald-500 font-medium">
                      {data.totalRevenue > 0 ? Math.round((restaurant.revenue / data.totalRevenue) * 100) : 0}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No restaurant data available</p>
              <p className="text-xs text-muted-foreground">Revenue by restaurant will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}