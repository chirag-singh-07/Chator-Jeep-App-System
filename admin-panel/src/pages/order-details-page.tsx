import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusTimeline } from "@/components/admin/status-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allOrders } from "@/data/dashboard-data";
import { formatCurrency } from "@/lib/format";

export function OrderDetailsPage() {
  const { orderId } = useParams();
  const order = allOrders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Order not found</CardTitle>
          <CardDescription>The requested order record does not exist in the current dummy dataset.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" className="w-fit" asChild>
        <Link to="/orders">
          <ArrowLeft data-icon="inline-start" />
          Back to Orders
        </Link>
      </Button>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {order.id}
              <StatusBadge value={order.status} />
            </CardTitle>
            <CardDescription>
              Created {order.createdAt} and last updated {order.updatedAt}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="mt-2 font-medium">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
              <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Kitchen</p>
              <p className="mt-2 font-medium">{order.kitchenName}</p>
              <p className="text-sm text-muted-foreground">Kitchen ID: {order.kitchenId}</p>
              <p className="text-sm text-muted-foreground">Order total: {formatCurrency(order.amount)}</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Payment</p>
              <p className="mt-2 font-medium">{order.paymentMethod}</p>
              <p className="text-sm text-muted-foreground">Transaction: {order.transactionId}</p>
              <div className="mt-2">
                <StatusBadge value={order.paymentStatus} />
              </div>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Delivery</p>
              <p className="mt-2 font-medium">Rider: {order.rider}</p>
              <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
              <p className="text-sm text-muted-foreground">ETA: {order.deliveryEta}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Status Timeline</CardTitle>
            <CardDescription>Step-by-step order progression.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusTimeline steps={order.timeline} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>Order line items and pricing breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
