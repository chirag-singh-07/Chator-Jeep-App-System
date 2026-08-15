import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon, ShoppingBag01Icon, AnalyticsUpIcon, CookingPotIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import { ScrollReveal } from "./scroll-reveal";

const stats = [
  { label: "Today's Orders", val: "48", desc: "+12% from yesterday", color: "text-blue-500 bg-blue-500/10" },
  { label: "Today's Revenue", val: "₹18,420", desc: "+8% from yesterday", color: "text-green-500 bg-green-500/10" },
  { label: "Preparing", val: "7", desc: "Active in kitchen", color: "text-amber-500 bg-amber-500/10" },
  { label: "Ready", val: "4", desc: "Waiting for dispatch", color: "text-emerald-500 bg-emerald-500/10" },
];

const recentOrders = [
  { id: "#1050", items: "Paneer Butter Masala + Garlic Naan", time: "5 mins ago", status: "Preparing", badgeColor: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
  { id: "#1049", items: "Cheese Burger × 2", time: "12 mins ago", status: "Ready", badgeColor: "bg-green-500/10 text-green-500 border border-green-500/20" },
  { id: "#1048", items: "Veg Loaded Pizza (L) + Fries", time: "18 mins ago", status: "Completed", badgeColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border" },
  { id: "#1047", items: "Masala Fries × 3 + Cold Coffee", time: "25 mins ago", status: "Preparing", badgeColor: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
];

export function PopularDishes() {
  return (
    <section id="dashboard" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 space-y-12">
        {/* Section Heading */}
        <ScrollReveal>
          <div className="text-center max-w-[620px] mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Live Monitoring</span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground dark:text-zinc-50">
              Your Restaurant at a Glance
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Track incoming tickets, review instant sales performance, and audit kitchen workflows from your central control center.
            </p>
          </div>
        </ScrollReveal>

        {/* Dashboard Analytics & Orders Row */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left stats and list */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {stats.map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 50} animation="fade-in-up">
                  <div className="border bg-card rounded-2xl p-4 space-y-2 text-left h-full shadow-xs">
                    <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">{item.label}</span>
                    <h3 className="font-heading text-2xl font-black text-foreground dark:text-zinc-50 mt-1">
                      {item.val}
                    </h3>
                    <span className="text-[10px] text-zinc-400 leading-tight block">
                      {item.desc}
                    </span>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Recent Orders List Card */}
            <ScrollReveal delay={150} animation="fade-in-up">
              <Card className="rounded-2xl border bg-card shadow-md">
                <CardHeader className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-heading text-lg font-bold text-foreground">Recent Orders</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">Real-time incoming kitchen queue</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">LIVE</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {recentOrders.map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 pb-3 border-b last:border-none last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-zinc-500 font-bold shrink-0">{order.id}</span>
                        <div className="text-left">
                          <h4 className="text-sm font-bold leading-tight text-foreground dark:text-zinc-100 line-clamp-1">{order.items}</h4>
                          <span className="text-xs text-zinc-400 block mt-0.5">{order.time}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${order.badgeColor}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          {/* Right Showcase chart card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <ScrollReveal delay={200} animation="slide-right" className="h-full">
              <Card className="rounded-2xl border bg-card shadow-md flex flex-col h-full justify-between">
                <CardHeader className="p-6 border-b">
                  <div>
                    <CardTitle className="font-heading text-lg font-bold text-foreground">Weekly Revenue</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">Performance tracking indicator</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-grow flex flex-col justify-center">
                  {/* SVG Chart Mockup */}
                  <svg className="w-full h-48 mt-4 text-primary" viewBox="0 0 500 200">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="50" y1="20" x2="480" y2="20" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="70" x2="480" y2="70" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="120" x2="480" y2="120" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="170" x2="480" y2="170" stroke="#d4d4d8" className="dark:stroke-zinc-700" strokeWidth="1" />
                    {/* Curved Path */}
                    <path d="M 50,150 Q 120,60 190,130 T 330,80 T 480,40" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 50,150 Q 120,60 190,130 T 330,80 T 480,40 L 480,170 L 50,170 Z" fill="url(#chartGradient)" />
                    {/* Labels */}
                    <text x="50" y="190" fill="#71717a" fontSize="10" fontWeight="bold" textAnchor="middle">Mon</text>
                    <text x="120" y="190" fill="#71717a" fontSize="10" fontWeight="bold" textAnchor="middle">Tue</text>
                    <text x="190" y="190" fill="#71717a" fontSize="10" fontWeight="bold" textAnchor="middle">Wed</text>
                    <text x="260" y="190" fill="#71717a" fontSize="10" fontWeight="bold" textAnchor="middle">Thu</text>
                    <text x="330" y="190" fill="#71717a" fontSize="10" fontWeight="bold" textAnchor="middle">Fri</text>
                    <text x="400" y="190" fill="#71717a" fontSize="10" fontWeight="bold" textAnchor="middle">Sat</text>
                    <text x="480" y="190" fill="#71717a" fontSize="10" fontWeight="bold" textAnchor="middle">Sun</text>
                  </svg>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
                    <span>Highest day: <strong>Sunday (₹24,800)</strong></span>
                    <span className="text-green-600 font-bold">↑ 18.2% vs last week</span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
