import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { statsCards, categoryDistributionData } from "@/data/dashboard-data";
import { TrendingUp, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const data = [
  { name: 'Mon', sales: 4000, revenue: 2400 },
  { name: 'Tue', sales: 3000, revenue: 1398 },
  { name: 'Wed', sales: 2000, revenue: 9800 },
  { name: 'Thu', sales: 2780, revenue: 3908 },
  { name: 'Fri', sales: 1890, revenue: 4800 },
  { name: 'Sat', sales: 2390, revenue: 3800 },
  { name: 'Sun', sales: 3490, revenue: 4300 },
];

export function AnalyticsSalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your platform's sales performance and trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl">
            <Calendar className="mr-2 h-4 w-4" /> Last 30 Days
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.slice(0, 4).map((stat, i) => (
          <Card key={i} className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
               <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{stat.title}</p>
               <div className="flex items-baseline gap-2 mt-2">
                  <h2 className="text-3xl font-bold">{stat.value}</h2>
                  <span className={`text-xs font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.trend.split(' ')[0]}
                  </span>
               </div>
               <p className="text-[10px] text-muted-foreground mt-1">vs last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm p-2">
          <CardHeader>
            <CardTitle>Revenue vs Sales Trend</CardTitle>
            <CardDescription>Daily comparison of volume and value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm p-2">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Performance of different food categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistributionData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {categoryDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
             <CardTitle>Top Selling Items</CardTitle>
             <CardDescription>Items contributing most to revenue</CardDescription>
          </div>
          <Button variant="ghost" className="rounded-xl">View All</Button>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
              {[
                { name: "Family Burger Box", sales: 842, revenue: "₹8.4L", growth: "+12%" },
                { name: "Paneer Tikka Wrap", sales: 1240, revenue: "₹3.1L", growth: "+8%" },
                { name: "Cold Coffee", sales: 2100, revenue: "₹2.5L", growth: "+15%" },
                { name: "Makhani Bowl", sales: 450, revenue: "₹1.4L", growth: "-2%" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                         #{i+1}
                      </div>
                      <div>
                         <p className="font-bold">{item.name}</p>
                         <p className="text-xs text-muted-foreground">{item.sales} units sold</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-bold">{item.revenue}</p>
                      <p className={`text-xs font-bold ${item.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {item.growth}
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
