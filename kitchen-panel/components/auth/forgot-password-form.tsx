"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";
import { apiClient } from "@/lib/api/axios";

export function ForgotPasswordForm() {
  const router = useRouter();
  
  const [step, setStep] = React.useState<"EMAIL" | "OTP" | "PASSWORD">("EMAIL");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getApiMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return setError("Please enter a valid email address.");
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/request-otp", {
        email: normalizedEmail,
        type: "forgot_password",
      });
      setStep("OTP");
      setSuccessMessage("A 6-digit reset code has been sent to your email.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(getApiMessage(err, "Could not send reset OTP. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp.trim())) {
      return setError("Please enter the 6-digit OTP sent to your email.");
    }
    setStep("PASSWORD");
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password.length < 8 || password.length > 64) {
      return setError("Password must be between 8 and 64 characters.");
    }
    if (password !== confirmPassword) {
      return setError("New password and confirm password do not match.");
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", {
        email,
        otp: otp.trim(),
        password,
      });
      setSuccessMessage("Your password has been updated successfully.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(getApiMessage(err, "Could not reset your password. Please check the OTP and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setError(null);
    setSuccessMessage(null);
    if (step === "PASSWORD") setStep("OTP");
    else if (step === "OTP") setStep("EMAIL");
  };

  const title =
    step === "EMAIL" ? "Reset Access" : step === "OTP" ? "Verify OTP" : "New Password";
  const subtitle =
    step === "EMAIL"
      ? "Enter your restaurant account email to receive a secure reset code."
      : step === "OTP"
        ? `Enter the 6-digit code sent to ${email}.`
        : "Create a new password for your kitchen partner account.";

  return (
    <div className="w-full max-w-[400px] px-4 md:px-0">
      <Card className="rounded-2xl border shadow-xl bg-card">
        <CardHeader className="space-y-1.5 p-6 pb-4">
          <CardTitle className="font-heading text-2xl font-black text-center text-foreground dark:text-zinc-50">
            {title}
          </CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            {subtitle}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 pt-0 space-y-5">
          {error && (
            <div className="p-3 text-xs font-semibold rounded-xl bg-destructive/10 text-destructive dark:bg-destructive/20 border border-destructive/20 animate-in fade-in-50 text-left">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-3 text-xs font-semibold rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20 border border-green-500/20 animate-in fade-in-50 text-left">
              {successMessage}
            </div>
          )}

          <form onSubmit={step === "EMAIL" ? sendOtp : step === "OTP" ? verifyOtp : resetPassword} className="space-y-4">
            
            {step === "EMAIL" && (
              <div className="space-y-1.5 text-left animate-in fade-in-50">
                <Label htmlFor="email" className="text-xs font-bold text-foreground dark:text-zinc-300">
                  Official Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="partner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="py-5"
                />
              </div>
            )}

            {step === "OTP" && (
              <div className="space-y-1.5 text-left animate-in fade-in-50">
                <Label htmlFor="otp" className="text-xs font-bold text-foreground dark:text-zinc-300">
                  6-Digit OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="py-5 text-center tracking-widest text-lg font-bold"
                />
              </div>
            )}

            {step === "PASSWORD" && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-bold text-foreground dark:text-zinc-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="py-5 pr-10"
                    />
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                    >
                      <HugeiconsIcon icon={showPassword ? EyeOffIcon : EyeIcon} size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-bold text-foreground dark:text-zinc-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="py-5 pr-10"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step !== "EMAIL" && (
                <Button type="button" variant="outline" onClick={goBack} disabled={isLoading} className="flex-1 rounded-full py-5 font-bold shadow-md">
                  Back
                </Button>
              )}
              <Button type="submit" disabled={isLoading || (step === "PASSWORD" && !!successMessage)} className="flex-1 rounded-full py-5 font-bold shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                {isLoading ? "Please wait..." : step === "EMAIL" ? "Send Code" : step === "OTP" ? "Verify" : "Reset Password"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex justify-center border-t border-zinc-100 dark:border-zinc-900 py-4 text-xs">
          <span className="text-muted-foreground">
            Remembered your password?{" "}
            <a href="/login" onClick={(e) => { e.preventDefault(); router.push('/login'); }} className="font-bold text-primary hover:underline">
              Sign In
            </a>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
