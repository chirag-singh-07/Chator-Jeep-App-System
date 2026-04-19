import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { allOrders, usersSeed } from "@/data/dashboard-data";

export function UserDetailsPage() {
  const { userId } = useParams();
  const user = usersSeed.find((item) => item.id === userId);

  if (!user) {
    return <Card className="rounded-2xl p-6">User not found.</Card>;
  }

  const userOrders = allOrders.filter((order) => user.orderHistory.includes(order.id));

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
            <div className="text-sm text-muted-foreground">
              <p>{user.email}</p>
              <p>{user.phone}</p>
              <p>Joined {user.createdDate}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {user.addresses.map((address) => (
              <div key={address.id} className="rounded-2xl bg-muted/40 p-4">
                <p className="font-medium">{address.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{address.address}</p>
              </div>
            ))}
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
