import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthBranding } from "@/components/auth/auth-branding";

export const metadata: Metadata = {
  title: "Chatori Jeep Kitchen | Sign In",
  description: "Sign in to Chatori Jeep Kitchen to order your street-style favourites, track your orders and discover what's cooking.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-background font-sans">
      {/* Left Column - Branding (Desktop only) */}
      <div className="lg:col-span-5 h-full">
        <AuthBranding />
      </div>

      {/* Right Column - Authentication Card */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center py-12 lg:py-0 bg-muted/10 dark:bg-black/10 min-h-screen">
        <LoginForm />
      </div>
    </div>
  );
}
