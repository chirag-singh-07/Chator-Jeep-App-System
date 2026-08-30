"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IMAGES } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOffIcon, FireIcon } from "@hugeicons/core-free-icons";
import { useAuthStore } from "@/store/useAuthStore";
import { ScrollReveal } from "../landing/scroll-reveal";

export function LoginForm() {
  const router = useRouter();
  
  // Form states
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const { login } = useAuthStore();
  
  // Status states
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] px-6 py-8 relative">
      {/* Decorative background glow behind the form */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <ScrollReveal>
        <div className="flex flex-col space-y-6">
          
          {/* Header */}
          <div className="space-y-3 text-center lg:text-left">
            {/* Branding for Mobile view only */}
            <div className="flex items-center gap-2 justify-center lg:hidden select-none mb-6">
              <div className="p-2 bg-primary/20 border border-primary/30 rounded-xl text-primary shadow-lg shadow-primary/20 shrink-0">
                <Image
                  src={IMAGES.logo}
                  alt="logo"
                  width={20}
                  height={20}
                  className="rounded-full w-5 h-5 object-contain"
                  priority
                />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-foreground dark:text-zinc-50">
                Chatori Jeep<span className="text-primary font-sans font-light"> Kitchen</span>
              </span>
            </div>

            <h1 className="font-heading text-4xl font-black tracking-tight text-foreground dark:text-white">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Enter your credentials to access the kitchen control center.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="p-4 text-sm font-semibold rounded-2xl bg-destructive/10 text-destructive dark:bg-destructive/20 border border-destructive/20 animate-in fade-in-50 slide-in-from-top-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></div>
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-4 text-sm font-semibold rounded-2xl bg-green-500/10 text-green-600 dark:bg-green-500/20 border border-green-500/20 animate-in fade-in-50 slide-in-from-top-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                Authentication successful. Entering dashboard...
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                disabled={isLoading || success}
                placeholder="operator@chatorijeep.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-6 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-300 shadow-sm"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <a
                  href="/forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/forgot-password");
                  }}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading || success}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="py-6 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-300 shadow-sm pr-12"
                />
                
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  disabled={isLoading || success}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors focus:outline-none"
                >
                  <HugeiconsIcon
                    icon={showPassword ? EyeOffIcon : EyeIcon}
                    size={20}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || success}
              className="w-full rounded-2xl py-6 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 mt-6 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group"
            >
              <span className="flex items-center gap-2">
                {isLoading ? "Verifying..." : "Sign In Securely"}
                {!isLoading && (
                  <svg className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </span>
            </Button>
          </form>

          {/* Footer Info */}
          <div className="pt-6 text-center text-sm text-muted-foreground mt-4 border-t border-border/50">
            Need credentials? Contact the{" "}
            <a href="/register" onClick={(e) => { e.preventDefault(); router.push("/register"); }} className="font-bold text-primary hover:underline transition-all">
              system administrator
            </a>
            .
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
