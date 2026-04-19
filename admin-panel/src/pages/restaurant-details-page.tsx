import { ArrowLeft, PencilLine } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { allOrders, restaurantsSeed } from "@/data/dashboard-data";
import { formatCurrency } from "@/lib/format";

export function RestaurantDetailsPage() {
  const { restaurantId } = useParams();
  const restaurant = restaurantsSeed.find((item) => item.id === restaurantId);

  if (!restaurant) {
    return <Card className="rounded-2xl p-6">Restaurant not found.</Card>;
  }

  const orders = allOrders.filter((order) => restaurant.orderIds.includes(order.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" className="w-fit" asChild>
          <Link to="/restaurants">
            <ArrowLeft data-icon="inline-start" />
            Back to Restaurants
          </Link>
        </Button>
        <Button variant="outline" className="w-fit" asChild>
          <Link to="/restaurants/new">
            <PencilLine data-icon="inline-start" />
            Add Similar Restaurant
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>{restaurant.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={restaurant.status} />
              <StatusBadge
                value={
                  restaurant.type === "requested"
                    ? "Pending"
                    : restaurant.type === "flagged"
                      ? "Inactive"
                      : restaurant.type === "closed"
                        ? "Closed"
                        : "Open"
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">Owner: {restaurant.owner}</p>
            <p className="text-sm text-muted-foreground">Cuisine: {restaurant.cuisine}</p>
            <p className="text-sm text-muted-foreground">Location: {restaurant.location}</p>
            <p className="text-sm text-muted-foreground">Contact: {restaurant.contactEmail}</p>
            <p className="text-sm text-muted-foreground">Phone: {restaurant.contactPhone}</p>
            <p className="text-sm text-muted-foreground">Avg prep time: {restaurant.avgPrepTime}</p>
            {restaurant.requestDate ? <p className="text-sm text-muted-foreground">Requested: {restaurant.requestDate}</p> : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle>Ratings Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            {[
              ["Overall", restaurant.rating ? `${restaurant.rating.toFixed(1)} / 5` : "--"],
              ["Reviews", `${restaurant.ratingsSummary.totalReviews}`],
              ["Five star", `${restaurant.ratingsSummary.fiveStar}`],
              ["Below four", `${restaurant.ratingsSummary.belowFourStar}`]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Restaurant Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{restaurant.notes || "No notes added for this restaurant yet."}</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {restaurant.menuItems.length ? (
            restaurant.menuItems.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="mt-2 font-semibold">{formatCurrency(item.price)}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
              No menu items added yet. This restaurant is likely still in the request or review stage.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Orders from this Kitchen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {orders.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-2xl border p-4">
                <p className="font-medium">{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge value={order.status} />
                  <span className="font-medium">{formatCurrency(order.amount)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
              No orders have been placed from this kitchen yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
