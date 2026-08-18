"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOffIcon, FireIcon, ShieldIcon } from "@hugeicons/core-free-icons";
import { useAuthStore } from "@/store/useAuthStore";

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
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] px-4 md:px-0">
      {/* Branding for Mobile view only */}
      <div className="flex items-center gap-2 justify-center mb-8 lg:hidden select-none">
        <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
          <HugeiconsIcon icon={FireIcon} size={18} strokeWidth={2.5} />
        </div>
        <span className="font-heading text-xl font-bold tracking-tight text-foreground dark:text-zinc-50">
          Chatori Jeep<span className="text-primary font-sans font-light"> Kitchen</span>
        </span>
      </div>

      <Card className="rounded-2xl border shadow-xl bg-card">
        <CardHeader className="space-y-1.5 p-6 pb-4">
          <CardTitle className="font-heading text-2xl font-black text-center lg:text-left text-foreground dark:text-zinc-50">
            Welcome Back 👋
          </CardTitle>
          <CardDescription className="text-center lg:text-left text-sm text-muted-foreground">
            Sign in to your restaurant operator dashboard.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 pt-0 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 text-xs font-semibold rounded-xl bg-destructive/10 text-destructive dark:bg-destructive/20 border border-destructive/20 animate-in fade-in-50 text-left">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-3 text-xs font-semibold rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20 border border-green-500/20 animate-in fade-in-50 text-left">
                Sign in successful! Entering kitchen dashboard...
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-xs font-bold text-foreground dark:text-zinc-300">
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
                className="py-5"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-foreground dark:text-zinc-300">
                  Password
                </Label>
                <a
                  href="/forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/forgot-password");
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Forgot Password?
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
                  className="py-5 pr-10"
                />
                
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  disabled={isLoading || success}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                >
                  <HugeiconsIcon
                    icon={showPassword ? EyeOffIcon : EyeIcon}
                    size={16}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || success}
              className="w-full rounded-full py-5 font-bold shadow-md shadow-primary/20 mt-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              {isLoading ? "Verifying..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex justify-center border-t border-zinc-100 dark:border-zinc-900 mt-4 py-4 text-xs select-none">
          <span className="text-muted-foreground">
            Operator registration is managed by admins. Need credentials?{" "}
            <a href="/register" onClick={(e) => { e.preventDefault(); router.push("/register"); }} className="font-bold text-primary hover:underline">
              Request Access
            </a>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
