"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  User as UserIcon, 
  Shield, 
  Activity, 
  ShoppingBag,
  ExternalLink,
  Loader2,
  Lock,
  MessageSquare
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminService } from "@/services/admin.service";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function UserDetailsPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await adminService.getUserById(userId);
        if (response.success || response) {
          setUser(response.data || response);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[400px] rounded-3xl lg:col-span-1" />
          <Skeleton className="h-[400px] rounded-3xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="rounded-[32px] border-none shadow-xl p-12 text-center bg-card">
        <div className="size-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <UserIcon className="size-8 text-red-500" />
        </div>
        <CardTitle className="text-2xl font-black italic uppercase italic">Operator Not Found</CardTitle>
        <CardDescription className="max-w-xs mx-auto mt-2">
          The user profile you are looking for might have been decommissioned or moved.
        </CardDescription>
        <Button variant="outline" className="mt-8 rounded-2xl" asChild>
          <Link to="/users">Return to Fleet</Link>
        </Button>
      </Card>
    );
  }

  const stats = [
    { label: "Lifetime Orders", value: user.orderHistory?.length || "0", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Account State", value: user.status || "Active", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Security Level", value: user.role === "ADMIN" ? "Level 3" : "Level 1", icon: Shield, color: "text-orange-500", bg: "bg-orange-500/10" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="rounded-2xl h-12 px-6 hover:bg-secondary/40 transition-all font-bold gap-2" asChild>
          <Link to="/users">
            <ArrowLeft className="size-4" />
            Back to Operators
          </Link>
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/30 transition-all">
            <Lock className="size-4 mr-2" /> Deactivate account
          </Button>
          <Button className="rounded-2xl h-12 px-8 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all">
            Manage Permissions
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden">
            <div className="h-32 w-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>
            <CardContent className="relative -mt-16 flex flex-col items-center text-center px-8 pb-10">
              <div className="size-32 rounded-[34px] bg-white p-1.5 shadow-2xl backdrop-blur-md mb-6">
                <div className="h-full w-full rounded-[28px] bg-secondary overflow-hidden border border-border/50">
                  <img
                    src={`https://api.dicebear.com/7.x/big-smile/svg?seed=${user.name}&backgroundColor=f1f5f9`}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-1 mb-6">
                <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">{user.name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <StatusBadge value={user.role} className="rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 italic">#{user._id?.slice(-6)}</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-border/10 group hover:border-primary/30 transition-all">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary">
                    <Mail className="size-4 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 leading-none mb-1">Electronic Mail</p>
                    <p className="text-sm font-bold truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-border/10 group hover:border-primary/30 transition-all">
                  <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center transition-colors group-hover:bg-orange-500">
                    <Phone className="size-4 text-orange-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 leading-none mb-1">Direct Line</p>
                    <p className="text-sm font-bold truncate">{user.phone || "+91 (Not Provided)"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-border/10 group hover:border-primary/30 transition-all">
                  <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center transition-colors group-hover:bg-emerald-500">
                    <Calendar className="size-4 text-emerald-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 leading-none mb-1">Platform Since</p>
                    <p className="text-sm font-bold truncate">{new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dynamic Workspace */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 rounded-3xl bg-card border border-border/50 shadow-xl shadow-primary/5 flex items-center gap-4 group hover:bg-secondary/10 transition-all">
                <div className={cn("size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("size-6", stat.color)} />
                </div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight leading-none mb-1">{stat.value}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Sections */}
          <div className="grid gap-8">
            <Card className="rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle className="text-xl font-black italic uppercase italic">Saved Operational Zones</CardTitle>
                  <CardDescription className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">Verified Delivery & Billing Addresses</CardDescription>
                </div>
                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="size-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid gap-4 md:grid-cols-2">
                  {(user.addresses || []).map((address: any, i: number) => (
                    <div key={i} className="relative p-6 rounded-[28px] bg-secondary/10 border border-border/20 group hover:border-primary/20 transition-all hover:bg-secondary/20">
                      <div className="flex items-start gap-4">
                        <div className="size-10 rounded-2xl bg-white border border-border/50 shadow-md flex items-center justify-center shrink-0">
                          <MapPin className="size-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-sm font-black uppercase tracking-wider text-foreground">{address.label}</h5>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{address.line1}, {address.city}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="absolute top-4 right-4 size-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                         <ExternalLink className="size-4" />
                      </Button>
                    </div>
                  ))}
                  {(!user.addresses || user.addresses.length === 0) && (
                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-secondary/20 rounded-[32px]">
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/30">No Address Fragments Found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-6 mt-4 px-8">
                 <CardTitle className="text-xl font-black italic uppercase italic">Recent Transmissions</CardTitle>
                 <Button variant="ghost" size="sm" className="text-xs font-black uppercase tracking-widest transition-all hover:bg-primary/10 hover:text-primary">View Full Stream</Button>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <div className="p-12 text-center border-2 border-dashed border-secondary/20 rounded-[32px] bg-secondary/5">
                  <div className="size-16 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="size-8 text-primary/30" />
                  </div>
                  <h5 className="text-lg font-black uppercase italic tracking-tight text-muted-foreground/40 mb-2">No Active Order Packets</h5>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/20 italic">This identity is currently idle in the transmission queue.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
