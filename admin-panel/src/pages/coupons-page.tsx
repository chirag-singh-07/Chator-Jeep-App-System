import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Plus, Timer, TrendingUp, Tag, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/status-badge";

export function CouponsPage() {
  const coupons = [
    { code: "CJWELCOME", type: "Percentage", discount: "20%", limit: "Rs 100", status: "Active", expiry: "2026-12-31" },
    { code: "LUNCH40", type: "Flat", discount: "Rs 40", limit: "Rs 200", status: "Active", expiry: "2026-06-15" },
    { code: "FREEDEL", type: "Free Delivery", discount: "Flat", limit: "Rs 500", status: "Expired", expiry: "2026-04-01" },
    { code: "BOGO50", type: "Percentage", discount: "50%", limit: "Rs 250", status: "Active", expiry: "2026-08-20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Collections</h1>
          <p className="text-muted-foreground">Manage discount coupons and promotional offers.</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         {coupons.map((coupon, i) => (
           <Card key={i} className="rounded-3xl border-none shadow-xl overflow-hidden group">
              <div className={`h-2 w-full ${coupon.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <CardContent className="pt-6 relative">
                 <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                    <Ticket className="h-6 w-6 text-primary" />
                 </div>
                 <div className="space-y-4">
                    <div>
                       <p className="text-2xl font-black tracking-tighter text-primary">{coupon.code}</p>
                       <p className="text-sm font-bold text-muted-foreground">{coupon.type} Offer</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="p-2 rounded-2xl bg-muted/50">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Discount</p>
                          <p className="text-sm font-bold">{coupon.discount}</p>
                       </div>
                       <div className="p-2 rounded-2xl bg-muted/50">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Min Order</p>
                          <p className="text-sm font-bold">{coupon.limit}</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-muted/50">
                       <StatusBadge value={coupon.status} />
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">Exp: {coupon.expiry}</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader>
           <CardTitle>Usage Performance</CardTitle>
           <CardDescription>How your coupons are being redeemed</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="h-48 flex items-end gap-2 px-4">
              {[60, 45, 80, 55, 90, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/20 hover:bg-primary rounded-t-xl transition-all" style={{ height: `${h}%` }} />
              ))}
           </div>
           <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground px-4">
              <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
