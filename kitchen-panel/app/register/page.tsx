import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { FireIcon } from "@hugeicons/core-free-icons";

export const metadata: Metadata = {
  title: "Chatori Jeep Kitchen | Sign Up",
  description: "Create an account at Chatori Jeep Kitchen to order your street-style favourites.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/10 dark:bg-black/10 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="flex items-center gap-2 mb-8 select-none">
        <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
          <HugeiconsIcon icon={FireIcon} size={18} strokeWidth={2.5} />
        </div>
        <span className="font-heading text-xl font-bold tracking-tight text-foreground dark:text-zinc-50">
          Chatori Jeep<span className="text-primary font-sans font-light"> Kitchen</span>
        </span>
      </div>

      <Card className="w-full max-w-[400px] rounded-2xl border shadow-xl bg-card">
        <CardHeader className="space-y-1.5 p-6 text-center">
          <CardTitle className="font-heading text-2xl font-black text-foreground dark:text-zinc-50">
            Create Account 🛺
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign up to start your street food journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 text-center space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Registration is currently closed for public testing. Please use the test credentials on the Sign In page.
          </p>
          <div className="p-3 text-xs text-left font-semibold rounded-xl bg-primary/10 text-primary border border-primary/25">
            <strong>Email:</strong> demo@chatori.com<br />
            <strong>Password:</strong> chatori123
          </div>
          <Link href="/login" className="block w-full">
            <Button className="w-full rounded-full py-5 font-bold mt-2">
              Go to Sign In
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-center border-t border-zinc-100 dark:border-zinc-900 py-4 text-xs">
          <span className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
