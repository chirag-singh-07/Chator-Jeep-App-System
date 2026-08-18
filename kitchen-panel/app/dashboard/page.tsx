"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
      <div className="p-6 bg-card border rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.name || 'Operator'}</h2>
        <p className="text-muted-foreground mb-6">
          Email: {user?.email} <br />
          Restaurant ID: {user?.restaurantId || 'N/A'} <br />
          Status: {user?.status}
        </p>
        <Button onClick={logout} variant="destructive">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
