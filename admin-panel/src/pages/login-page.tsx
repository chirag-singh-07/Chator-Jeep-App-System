"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Loader2, 
  ChefHat, 
  Truck, 
  Users, 
  LayoutDashboard 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { accessToken, user } = response.data;

      if (user.role !== "ADMIN") {
        throw new Error("Unauthorized access. Admin privileges required.");
      }

      localStorage.setItem("token", accessToken);
      setAuth(user, accessToken);
      navigate("/overview");
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to authenticate");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background font-sans overflow-hidden">
      {/* Left Section: Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#050510] flex-col justify-between p-12 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full" />
        
        {/* Header */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutDashboard className="size-6 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-widest uppercase">
            Platform <span className="text-primary">Admin</span>
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white tracking-tight leading-none mb-6">
            Everything starts <br /> 
            <span className="text-primary italic">with Control.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-md font-medium leading-relaxed mb-10">
            Manage your restaurants, orders, and delivery fleet from one unified, high-performance workspace.
          </p>

          <div className="grid grid-cols-2 gap-6 max-w-lg">
            {[
              { icon: ChefHat, label: "Partner Control", sub: "34 Active Kitchens" },
              { icon: Truck, label: "Fleet Health", sub: "128 Active Riders" },
              { icon: Users, label: "User Scope", sub: "12k+ Customers" },
              { icon: ShieldCheck, label: "Secure Ops", sub: "Enterprise Grade" }
            ].map((item, id) => (
              <div key={id} className="flex flex-col gap-2 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                <item.icon className="size-6 text-primary" />
                <div>
                  <div className="text-white text-sm font-bold">{item.label}</div>
                  <div className="text-white/40 text-[10px] uppercase font-black tracking-widest">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase">
            © 2026 CHATORI JEEP INC. ALL RIGHTS RESERVED.
          </p>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      </div>

      {/* Right Section: Logic & Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {/* Subtle accent for mobile/tablet */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-1 bg-primary" />
        
        <div className="w-full max-w-[420px] flex flex-col gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-foreground uppercase italic">System Access</h2>
            <p className="text-muted-foreground font-medium text-sm">
              Please enter your platform credentials to continue to the administrative workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Admin Identity</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@chatorijeep.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-10.5 bg-secondary/20 border-border/50 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Security Key</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-10.5 bg-secondary/20 border-border/50 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50 text-sm font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[13px] font-bold text-red-500 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-3xl shadow-lg shadow-primary/20 group transition-all"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Authorize Access
                    <ShieldCheck className="size-4 group-hover:scale-110 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="pt-6 border-t border-border/50">
            <p className="text-[10px] text-center text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
              Authorized Platform Ops Only • IP Logs Enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
