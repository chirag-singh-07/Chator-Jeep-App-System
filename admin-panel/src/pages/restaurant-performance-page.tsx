import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "@/services/admin.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Star,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantPerformancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [statsRes, restRes] = await Promise.all([
          adminService.getRestaurantStats(id),
          adminService.getRestaurantById(id),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (restRes.success) setRestaurant(restRes.data);
      } catch (error) {
        console.error("Failed to fetch performance data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !stats || !restaurant) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-3xl" />
      </div>
    );
  }

  const COLORS = ["#FFD700", "#FFC107", "#FFB300", "#FFA000", "#FF8F00"];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {restaurant.name}
            </h1>
            <p className="text-muted-foreground font-medium">
              Performance Intelligence & Growth Metrics
            </p>
          </div>
        </div>
        <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20">
          Download Report <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="font-black uppercase tracking-widest text-[10px]">
              Total Revenue
            </CardDescription>
            <CardTitle className="text-3xl font-black flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              ₹{stats.overview.totalEarnings.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
              <TrendingUp className="h-3 w-3" /> +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-black uppercase tracking-widest text-[10px]">
              Total Orders
            </CardDescription>
            <CardTitle className="text-3xl font-black flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              {stats.overview.totalOrders}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground font-bold text-xs uppercase tracking-tighter">
              {Math.round(stats.overview.totalOrders / 30)} orders per day avg
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-black uppercase tracking-widest text-[10px]">
              Wallet Balance
            </CardDescription>
            <CardTitle className="text-3xl font-black flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              ₹{stats.walletBalance.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary font-bold text-xs uppercase tracking-widest">
              Available for Payout
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-black uppercase tracking-widest text-[10px]">
              Platform Rating
            </CardDescription>
            <CardTitle className="text-3xl font-black flex items-center gap-2">
              <Star className="h-6 w-6 text-primary fill-primary" />
              {stats.rating?.toFixed(1) || "0.0"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground font-bold text-xs uppercase tracking-tighter">
              Based on {stats.totalReviews} customer reviews
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-black text-xl">Revenue Trends</CardTitle>
                <CardDescription className="font-medium">Daily performance over last 15 days</CardDescription>
              </div>
              <BarChart3 className="h-6 w-6 text-muted-foreground opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pr-8">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={stats.dailySales}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#888'}}
                  dy={10}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#888'}}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 900}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-2xl bg-white">
          <CardHeader>
            <CardTitle className="font-black text-xl">Best Sellers</CardTitle>
            <CardDescription className="font-medium">Top performing menu items</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={stats.topItems} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="_id" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fontWeight: 900, fill: '#444'}}
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 900}}
                />
                <Bar dataKey="quantity" radius={[0, 10, 10, 0]} barSize={20}>
                  {stats.topItems.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-3xl bg-slate-900 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
         <div className="absolute top-0 right-0 h-64 w-64 -mr-32 -mt-32 bg-primary/10 rounded-full blur-3xl" />
         <div>
            <h3 className="text-2xl font-black mb-2">Operational Health</h3>
            <p className="text-slate-400 font-medium max-w-md italic">
              "This partner is maintaining a high-performance profile with low cancellation rates. Growth trajectory is positive."
            </p>
         </div>
         <div className="flex gap-4">
            <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Avg Rating</p>
               <p className="text-2xl font-black">{stats.rating?.toFixed(1) || "N/A"}</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total Payouts</p>
               <p className="text-2xl font-black">₹0</p>
            </div>
         </div>
      </div>
    </div>
  );
}
