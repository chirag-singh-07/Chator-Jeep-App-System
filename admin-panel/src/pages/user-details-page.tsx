import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Mail, Phone, Calendar } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService } from "@/services/admin.service";
import { Skeleton } from "@/components/ui/skeleton";

export function UserDetailsPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await adminService.getUserById(userId);
        if (response.success || response) {
          setUser(response.data || response);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return <Skeleton className="h-[400px] rounded-2xl" />;
  }

  if (!user) {
    return <Card className="rounded-2xl p-6">User not found.</Card>;
  }

  const userOrders: any[] = []; // Order history fetching can be added later

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" className="w-fit" asChild>
        <Link to="/users">
          <ArrowLeft data-icon="inline-start" />
          Back to Users
        </Link>
      </Button>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <StatusBadge value={user.role} />
            <StatusBadge value={user.status} />
            <div className="text-sm text-muted-foreground flex flex-col gap-2mt-2">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {user.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {user.phone || "No phone"}</div>
              <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Joined {new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {(user.addresses || []).map((address: any, i: number) => (
              <div key={i} className="rounded-2xl bg-muted/40 p-4 border flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">{address.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{address.line1}, {address.city}</p>
                </div>
              </div>
            ))}
            {(!user.addresses || user.addresses.length === 0) && (
              <p className="text-sm text-muted-foreground col-span-2 py-4">No addresses saved.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {userOrders.map((order) => (
            <div key={order.id} className="rounded-2xl border p-4">
              <p className="font-medium">{order.id}</p>
              <p className="text-sm text-muted-foreground">{order.kitchenName}</p>
              <p className="mt-3">
                <StatusBadge value={order.status} />
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
