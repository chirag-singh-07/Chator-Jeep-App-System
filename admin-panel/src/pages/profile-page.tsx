"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit2,
  Camera,
  Key,
  Globe,
  Layout,
  CheckCircle2,
  Clock,
  Activity,
  User as UserIcon,
  Save,
  X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/useAuthStore";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "Admin User",
    email: user?.email || "admin@chatorijeep.com",
    phone: "+91 98110 11001",
    bio: "Lead Platform Operations Manager responsible for overseeing restaurant onboarding, operational quality, and dispatcher performance across the SaaS workspace."
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const permissions = [
    "User Management",
    "Partner Onboarding",
    "Inventory Oversight",
    "Financial Audits",
    "Platform Branding",
    "Security Configurations"
  ];

  const adminStats = [
    { label: "Accounts Created", value: "248", icon: UserIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Partners Verified", value: "34", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "System Changes", value: "1.2k", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Active Session", value: "02h 15m", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Premium Header Profile Section */}
      <div className="relative group">
        <div className="h-64 w-full rounded-[40px] bg-[#050510] relative overflow-hidden shadow-2xl">
          {/* Animated Background Gradients */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[120%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-full bg-blue-600/10 blur-[100px] rounded-full" />
          
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          
          <div className="absolute -bottom-16 left-12 flex items-end gap-8 z-10 transition-transform duration-500 group-hover:translate-x-2">
            <div className="relative">
              <div className="size-44 rounded-[40px] bg-white p-1.5 shadow-2xl backdrop-blur-md">
                <div className="h-full w-full rounded-[34px] bg-secondary overflow-hidden border border-border/50">
                  <img
                    src={`https://api.dicebear.com/7.x/big-smile/svg?seed=${user?.name || "Admin"}&backgroundColor=f8fafc`}
                    alt={user?.name}
                    className="h-full w-full object-cover scale-110 transition-transform duration-700 hover:scale-125"
                  />
                </div>
              </div>
              <Button
                size="icon"
                className="absolute bottom-3 right-3 size-10 rounded-2xl bg-primary text-white shadow-xl shadow-primary/40 hover:scale-110 transition-all border-4 border-white"
              >
                <Camera className="size-5" />
              </Button>
            </div>
            
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge value={user?.role || "ADMIN"} className="bg-primary/20 text-white border-primary/30" />
                <span className="text-white/40 text-xs font-black uppercase tracking-[0.25em]">Verified Admin</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter mb-1">
                {formData.name}
              </h1>
              <p className="text-white/60 font-medium flex items-center gap-2">
                <Globe className="size-4 text-primary" /> Senior Operations Director
              </p>
            </div>
          </div>

          <div className="absolute top-8 right-12 flex gap-3">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)} className="rounded-2xl px-6 bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-md">
                  <X className="mr-2 size-4" /> Cancel
                </Button>
                <Button onClick={handleSave} className="rounded-2xl px-8 bg-primary text-white shadow-xl shadow-primary/20">
                  <Save className="mr-2 size-4" /> Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="rounded-2xl px-8 bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-md">
                <Edit2 className="mr-2 size-4" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 mt-20">
        {/* Left Stats Console */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[32px] border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden">
            <CardHeader className="pb-4 bg-muted/30 border-b border-border/50">
              <CardTitle className="text-sm font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <UserIcon className="size-4 text-primary" /> Identity Console
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: Mail, label: "Official Email", value: formData.email, type: "email", key: "email" },
                  { icon: Phone, label: "Secure Line", value: formData.phone, type: "tel", key: "phone" },
                  { icon: Calendar, label: "Platform Tenure", value: "Since July 2025", type: "text", disabled: true }
                ].map((item, id) => (
                  <div key={id} className="relative">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5 ml-1">{item.label}</p>
                    <div className="relative group">
                      <item.icon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      {isEditing && !item.disabled ? (
                        <Input 
                          type={item.type}
                          value={formData[item.key as keyof typeof formData]} 
                          onChange={(e) => setFormData({...formData, [item.key!]: e.target.value})}
                          className="h-12 pl-11 rounded-2xl bg-secondary/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-sm font-bold" 
                        />
                      ) : (
                        <div className="h-12 pl-11 flex items-center rounded-2xl bg-secondary/10 border border-border/20 text-sm font-bold truncate">
                          {item.value}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-2xl shadow-primary/5 bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.15em] text-muted-foreground">Impact Metrics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-0">
              {adminStats.map((stat, i) => (
                <div key={i} className="p-5 rounded-[24px] bg-secondary/10 border border-border/10 flex flex-col gap-3 transition-all hover:bg-secondary/20">
                  <div className={cn("size-10 rounded-2xl flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("size-5", stat.color)} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black tracking-tighter">{stat.value}</h4>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">{stat.label}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Content Workspace */}
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-secondary/20 p-1.5 rounded-[24px] h-auto gap-1 border border-border/50">
              {["overview", "activity", "security"].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab} 
                  className="rounded-[18px] px-8 py-3 text-sm font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/10 transition-all"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-8 mt-8 animate-in fade-in slide-in-from-right-4">
              <Card className="rounded-[32px] border-none shadow-2xl shadow-primary/5 bg-card relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-black tracking-tight">Professional Dossier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative p-6 rounded-[24px] bg-primary/5 border border-primary/10 italic font-medium text-muted-foreground leading-relaxed">
                    {isEditing ? (
                      <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm min-h-[100px] font-medium text-foreground italic"
                      />
                    ) : (
                      <p className="text-sm leading-7">"{formData.bio}"</p>
                    )}
                    <Shield className="absolute bottom-4 right-4 size-8 text-primary/5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-none shadow-2xl shadow-primary/5 bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-black tracking-tight">Scope & Access Control</CardTitle>
                  <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground/50">System Authorized Permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-border/40 hover:border-primary/30 transition-all group">
                        <div className="size-2 rounded-full bg-primary shadow-lg shadow-primary/40 group-hover:scale-150 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{p}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-8 animate-in fade-in slide-in-from-right-4">
              <Card className="rounded-[32px] border-none shadow-2xl shadow-primary/5 bg-card">
                <CardContent className="pt-10">
                  <div className="relative pl-8 space-y-12 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary before:via-blue-500 before:to-transparent">
                    {[
                      { action: "Partner Verification", name: "Spicy Route Kitchen", time: "14:23 PM Today", desc: "Approved operating license and menu catalog after rigorous compliance audit." },
                      { action: "Fleet Expansion", name: "12 Delivery Riders", time: "11:05 AM Yesterday", desc: "Successfully onboarded new logistic partners for the Sector 18 Noida expansion." },
                      { action: "System Hardening", name: "V3.4 Alpha Patch", time: "09:12 AM April 17", desc: "Deplpoyed mandatory security updates for the Partner Console API interface." },
                      { action: "Category Overhaul", name: "Health & Gourmet", time: "18:45 PM April 15", desc: "Created high-growth category taxonomy to optimize night-time conversions." }
                    ].map((act, i) => (
                      <div key={i} className="relative group">
                        <div className="absolute -left-[27px] top-1.5 size-3.5 rounded-full bg-white border-2 border-primary shadow-xl z-10 group-hover:scale-125 transition-transform" />
                        <div className="space-y-1">
                          <h4 className="text-sm font-black uppercase tracking-wider text-foreground">{act.action}</h4>
                          <p className="text-xs font-bold text-primary italic">{act.name} • {act.time}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-2">{act.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-8 animate-in fade-in slide-in-from-right-4 gap-6 grid grid-cols-1 md:grid-cols-2">
              <Card className="rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group bg-card">
                <CardContent className="pt-8 flex flex-col items-center text-center gap-4">
                  <div className="size-16 rounded-[24px] bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Key className="size-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Authentication Vault</h3>
                    <p className="text-xs text-muted-foreground font-medium px-4 mt-2">Update your administrative credentials and secure your access path.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group bg-card">
                <CardContent className="pt-8 flex flex-col items-center text-center gap-4">
                  <div className="size-16 rounded-[24px] bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <Shield className="size-8 text-orange-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Security Hardening</h3>
                    <p className="text-xs text-muted-foreground font-medium px-4 mt-2">Configure Multi-Factor Authentication and session timeout protocols.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
