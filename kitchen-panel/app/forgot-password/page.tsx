import type { Metadata } from "next";
import { AuthBranding } from "@/components/auth/auth-branding";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Chatori Jeep Kitchen | Forgot Password",
  description: "Reset your Chatori Jeep Kitchen account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-background font-sans">
      {/* Left Column - Branding (Desktop only) */}
      <div className="lg:col-span-5 h-full">
        <AuthBranding />
      </div>

      {/* Right Column - Authentication Card */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center py-12 lg:py-0 bg-muted/10 dark:bg-black/10 min-h-screen">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
