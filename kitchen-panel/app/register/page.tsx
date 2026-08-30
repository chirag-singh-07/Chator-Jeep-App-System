import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthBranding } from "@/components/auth/auth-branding";

export const metadata: Metadata = {
  title: "Chatori Jeep Kitchen | Sign Up",
  description: "Register your kitchen with Chatori Jeep and start managing orders in real time.",
};

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-background font-sans">
      {/* Left Column - Branding (Desktop only) */}
      <div className="lg:col-span-5 h-full">
        <AuthBranding />
      </div>

      {/* Right Column - Registration Form */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center py-12 lg:py-0 bg-muted/10 dark:bg-black/10 min-h-screen">
        <RegisterForm />
      </div>
    </div>
  );
}
