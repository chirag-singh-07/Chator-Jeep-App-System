"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { TrendingUp, Download, Calendar, Loader2, ShoppingCart, IndianRupee, Percent, TrendingDown } from "lucide-react";
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

type SalesAnalytics = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  chartData: Array<{ label: string; date: string; orders: number; revenue: number }>;
  paymentMethodBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  period: { startDate: string; endDate: string };
};

export function AnalyticsSalesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalesAnalytics | null>(null);
  const [range, setRange] = useState("1m");

  useEffect(() => {
    setLoading(true);
    adminService.getAnalyticsSales({ range })
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

  const paymentMethodColors: Record<string, string> = {
    COD: "#94a3b8",
    ONLINE: "#3b82f6",
    WALLET: "#22c55e",
    PARTIAL_WALLET: "#f59e0b",
  };

  const paymentMethodLabels: Record<string, string> = {
    COD: "Cash on Delivery",
    ONLINE: "Online Payment",
    WALLET: "Wallet",
    PARTIAL_WALLET: "Partial Wallet",
  };

  const pieData = data?.paymentMethodBreakdown
    ? Object.entries(data.paymentMethodBreakdown).map(([name, value]) => ({
        name: paymentMethodLabels[name] || name,
        value,
        color: paymentMethodColors[name] || "#94a3b8"
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your platform's sales performance and trends.</p>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-3xl">
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Orders</p>
                  <h2 className="text-2xl font-bold">{data?.totalOrders || 0}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <div className="rounded-2xl bg-amber-100 p-3">
                  <Percent className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Avg Order Value</p>
                  <h2 className="text-2xl font-bold">{formatCurrency(data?.averageOrderValue || 0)}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-purple-100 p-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Daily Average</p>
                  <h2 className="text-2xl font-bold">
                    {data?.chartData?.length ? Math.round(data.totalOrders / data.chartData.length) : 0}
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm p-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={data?.chartData || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} tickFormatter={(v: number) => `Rs ${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm p-2">
          <CardHeader>
            <CardTitle>Orders by Category</CardTitle>
            <CardDescription>Payment method distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={data?.chartData?.slice(-7) || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                    <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10}} width={50} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Order distribution by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full rounded-2xl" />
            ) : (
              <div className="space-y-3">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{item.value}</span>
                      <span className="text-xs text-muted-foreground">
                        ({data?.totalOrders ? Math.round((item.value / data.totalOrders) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
                {pieData.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No payment data available</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
            <CardDescription>Orders by current status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full rounded-2xl" />
            ) : (
              <div className="space-y-3">
                {data?.statusBreakdown && Object.entries(data.statusBreakdown).length > 0 ? (
                  Object.entries(data.statusBreakdown).map(([status, count]) => {
                    const percentage = data.totalOrders ? Math.round((count / data.totalOrders) * 100) : 0;
                    const statusColors: Record<string, string> = {
                      DELIVERED: "bg-emerald-500",
                      COMPLETED: "bg-emerald-500",
                      PENDING: "bg-amber-500",
                      PLACED: "bg-amber-500",
                      ACCEPTED: "bg-blue-500",
                      PREPARING: "bg-indigo-500",
                      READY: "bg-purple-500",
                      PICKED_UP: "bg-cyan-500",
                      CANCELLED: "bg-red-500",
                    };
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{status}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${statusColors[status] || "bg-primary"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No status data available</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}