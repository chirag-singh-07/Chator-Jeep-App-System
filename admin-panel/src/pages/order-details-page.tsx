import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusTimeline } from "@/components/admin/status-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allOrders } from "@/data/dashboard-data";
import { formatCurrency } from "@/lib/format";
import { adminService } from "@/services/admin.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    if (orderId.startsWith("mock_")) {
      const mockOrder = allOrders.find((item) => item.id === orderId);
      setOrder(mockOrder);
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getOrderById(orderId);
        if (res.success && res.data) {
          const apiOrder = res.data;
          
          // Map API order to match UI expectations
          const mappedOrder = {
            id: apiOrder._id,
            status: apiOrder.status,
            createdAt: new Date(apiOrder.createdAt).toLocaleString("en-IN"),
            updatedAt: new Date(apiOrder.updatedAt).toLocaleString("en-IN"),
            customerName: apiOrder.userId?.name || "Customer",
            customerEmail: apiOrder.userId?.email || "N/A",
            customerPhone: apiOrder.userId?.phone || "N/A",
            kitchenName: apiOrder.restaurantId?.name || "N/A",
            kitchenId: apiOrder.restaurantId?._id || apiOrder.restaurantId || "N/A",
            amount: apiOrder.totalAmount,
            paymentMethod: apiOrder.paymentMethod || "ONLINE",
            transactionId: apiOrder.razorpayPaymentId || apiOrder.phonepeTransactionId || "N/A",
            paymentStatus: apiOrder.paymentStatus || "UNPAID",
            rider: apiOrder.deliveryId?.userId?.name || "Not Assigned",
            deliveryAddress: apiOrder.deliveryAddress,
            deliveryEta: apiOrder.status === "DELIVERED" ? "Delivered" : "Pending Assign",
            isBulkOrder: apiOrder.isBulkOrder,
            scheduledDeliveryTime: apiOrder.scheduledDeliveryTime,
            timeline: [
              {
                status: "PENDING",
                label: "Order Placed",
                time: new Date(apiOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                description: "Customer successfully checked out.",
                current: apiOrder.status === "PENDING"
              },
              ...(apiOrder.status !== "PENDING" ? [{
                status: apiOrder.status,
                label: `Current: ${apiOrder.status}`,
                time: new Date(apiOrder.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                description: `Order transitioned to ${apiOrder.status}.`,
                current: true
              }] : [])
            ],
            items: apiOrder.items.map((it: any) => ({
              name: it.name,
              qty: it.quantity,
              price: it.price
            }))
          };
          
          setOrder(mappedOrder);
        } else {
          setError(res.message || "Failed to load order");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Error Loading Order</CardTitle>
          <CardDescription>{error || "The requested order record does not exist."}</CardDescription>
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

      {order.isBulkOrder && (
        <Alert className="bg-orange-50 border-orange-200 text-orange-900 rounded-2xl">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="font-semibold text-orange-800">📦 Bulk / Party Order</AlertTitle>
          <AlertDescription className="text-orange-700">
            This is a scheduled bulk order. Delivery is requested on{" "}
            <strong>
              {new Date(order.scheduledDeliveryTime).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </strong>{" "}
            at{" "}
            <strong>
              {new Date(order.scheduledDeliveryTime).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </strong>.
          </AlertDescription>
        </Alert>
      )}

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
              {order.items.map((item: any) => (
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
