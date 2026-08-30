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
      <div className="lg:col-span-5 h-full relative overflow-hidden">
        <AuthBranding />
      </div>

      {/* Right Column - Authentication Card */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center py-12 lg:py-0 bg-white dark:bg-zinc-950 min-h-screen relative overflow-hidden">
        {/* Subtle grid pattern background for the form side */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <LoginForm />
      </div>
    </div>
  );
}
