"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CreditCard, Download, IndianRupee, Loader2, Printer, Search, TrendingUp, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip-primitive";
import { usePaymentsStore, type PaymentRecord } from "@/stores/usePaymentsStore";
import { formatCurrency } from "@/lib/format";

const pageSize = 20;

type ColumnKey = "id" | "customer" | "restaurant" | "method" | "gateway" | "status" | "amount" | "date" | "actions";

const columnDefaults: Record<ColumnKey, boolean> = {
  id: true,
  customer: true,
  restaurant: true,
  method: true,
  gateway: true,
  status: true,
  amount: true,
  date: true,
  actions: true
};

const paymentMethods = [
  { value: "all", label: "All Methods" },
  { value: "COD", label: "Cash on Delivery" },
  { value: "ONLINE", label: "Online Payment" },
  { value: "WALLET", label: "Wallet" },
  { value: "PARTIAL_WALLET", label: "Partial Wallet" },
];

const paymentStatuses = [
  { value: "all", label: "All Status" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PREPARING", label: "Preparing" },
  { value: "CANCELLED", label: "Cancelled" },
];

function PaymentDetailsModal({ payment, open, onClose }: { payment: PaymentRecord | null; open: boolean; onClose: () => void }) {
  if (!payment) return null;

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      COD: "Cash on Delivery",
      ONLINE: "Online Payment",
      WALLET: "Wallet",
      PARTIAL_WALLET: "Partial Wallet + COD",
    };
    return labels[method] || method;
  };

  const getGatewayLabel = (gateway?: string | null | undefined) => {
    const labels: Record<string, string> = {
      RAZORPAY: "Razorpay",
      PHONEPE: "PhonePe",
    };
    return labels[gateway || ""] || "-";
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Complete transaction information for order {payment._id.slice(-8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-sm">{payment._id}</p>
            </div>
            <Badge variant={payment.paymentStatus === "PAID" ? "default" : "secondary"}>
              {payment.paymentStatus}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Customer</h4>
              <div className="rounded-xl border bg-card p-3">
                <p className="font-medium">{payment.userId?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{payment.userId?.phone || "No phone"}</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Restaurant</h4>
              <div className="rounded-xl border bg-card p-3">
                <p className="font-medium">{payment.restaurantId?.name || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Payment Information</h4>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">Method</p>
                <p className="font-medium">{getMethodLabel(payment.paymentMethod)}</p>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">Gateway</p>
                <p className="font-medium">{getGatewayLabel(payment.paymentGateway)}</p>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-medium">{formatCurrency(payment.totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Amount Breakdown</h4>
            <div className="rounded-xl border bg-card p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Food Amount</span>
                  <span>{formatCurrency(payment.foodAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatCurrency(payment.deliveryFee)}</span>
                </div>
                {payment.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Coupon Discount ({payment.couponCode})</span>
                    <span>-{formatCurrency(payment.couponDiscount)}</span>
                  </div>
                )}
                {payment.walletAmountUsed && payment.walletAmountUsed > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Wallet Used</span>
                    <span>{formatCurrency(payment.walletAmountUsed)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(payment.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {payment.razorpayPaymentId && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Gateway Transaction</h4>
              <div className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">Razorpay Payment ID</p>
                <p className="font-mono text-sm">{payment.razorpayPaymentId}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Created: {new Date(payment.createdAt).toLocaleString("en-IN")}</span>
            <span>Updated: {new Date(payment.updatedAt).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RefundModal({ order, open, onClose, onSubmit }: {
  order: PaymentRecord;
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState(order?.totalAmount || 0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setAmount(order.totalAmount);
      setReason("");
    }
  }, [order]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(amount, reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Issue a full or partial refund for order {order._id.slice(-8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Refund Amount</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                max={order.totalAmount}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">Maximum: {formatCurrency(order.totalAmount)}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Refund</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Customer requested cancellation, item missing, quality issue..."
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !reason.trim()} className="flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Process Refund"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>(columnDefaults);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [refundOrder, setRefundOrder] = useState<PaymentRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const { payments, loading, filters, setFilters, fetchPayments, stats, statsLoading, fetchPaymentStats, processRefund, total } = usePaymentsStore();

  const activeStatus = searchParams.get("status") ?? "all";
  const activeMethod = searchParams.get("method") ?? "all";

  useEffect(() => {
    setFilters({ status: activeStatus, method: activeMethod, page: 1 });
  }, [activeStatus, activeMethod, setFilters]);

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, [filters.status, filters.method, filters.page, filters.search]);

  const columnsConfig = useMemo(() => {
    const allColumns: Array<{ key: ColumnKey; column: { key: string; label: string; render: (row: PaymentRecord) => React.ReactNode; className?: string } }> = [
      {
        key: "id",
        column: {
          key: "_id",
          label: "Order ID",
          render: (row) => (
            <span className="font-mono text-xs">{row._id.slice(-8).toUpperCase()}</span>
          )
        }
      },
      {
        key: "customer",
        column: {
          key: "customer",
          label: "Customer",
          render: (row) => (
            <div>
              <p className="font-medium">{row.userId?.name || "N/A"}</p>
              <p className="text-xs text-muted-foreground">{row.userId?.phone || "-"}</p>
            </div>
          )
        }
      },
      {
        key: "restaurant",
        column: {
          key: "restaurant",
          label: "Restaurant",
          render: (row) => row.restaurantId?.name || "N/A"
        }
      },
      {
        key: "method",
        column: {
          key: "method",
          label: "Method",
          render: (row) => {
            const methodStyles: Record<string, string> = {
              COD: "bg-slate-100 text-slate-700",
              ONLINE: "bg-blue-100 text-blue-700",
              WALLET: "bg-emerald-100 text-emerald-700",
              PARTIAL_WALLET: "bg-amber-100 text-amber-700",
            };
            const labels: Record<string, string> = {
              COD: "COD",
              ONLINE: "Online",
              WALLET: "Wallet",
              PARTIAL_WALLET: "Partial",
            };
            return (
              <Badge variant="outline" className={`${methodStyles[row.paymentMethod]} font-medium`}>
                {labels[row.paymentMethod] || row.paymentMethod}
              </Badge>
            );
          }
        }
      },
      {
        key: "gateway",
        column: {
          key: "gateway",
          label: "Gateway",
          render: (row) => row.paymentGateway ? (
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {row.paymentGateway}
            </Badge>
          ) : "-"
        }
      },
      {
        key: "status",
        column: {
          key: "status",
          label: "Status",
          render: (row) => {
            const statusStyles: Record<string, string> = {
              COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
              PENDING: "bg-amber-100 text-amber-700 border-amber-200",
              ACCEPTED: "bg-blue-100 text-blue-700 border-blue-200",
              PREPARING: "bg-indigo-100 text-indigo-700 border-indigo-200",
              CANCELLED: "bg-red-100 text-red-700 border-red-200",
            };
            const style = statusStyles[row.status] || "bg-secondary text-secondary-foreground";
            return (
              <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${style}`}>
                {row.status}
              </Badge>
            );
          }
        }
      },
      {
        key: "amount",
        column: {
          key: "amount",
          label: "Amount",
          render: (row) => (
            <span className="font-semibold">{formatCurrency(row.totalAmount)}</span>
          )
        }
      },
      {
        key: "date",
        column: {
          key: "date",
          label: "Date",
          render: (row) => new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })
        }
      },
      {
        key: "actions",
        column: {
          key: "actions",
          label: "Actions",
          render: (row) => (
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPayment(row);
                      setShowDetailsModal(true);
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>
              {(row.paymentStatus === "PAID" || row.paymentStatus === "COMPLETED") && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRefundOrder(row);
                        setShowRefundModal(true);
                      }}
                    >
                      <X className="h-4 w-4 text-amber-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refund</TooltipContent>
                </Tooltip>
              )}
            </div>
          )
        }
      }
    ];

    return allColumns.filter((entry) => columns[entry.key]).map((entry) => entry.column);
  }, [columns]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = payments.slice((filters.page - 1) * pageSize, filters.page * pageSize);

  const exportCsv = () => {
    const headers = ["Order ID", "Customer", "Restaurant", "Method", "Gateway", "Status", "Amount", "Date"];
    const rows = payments.map((row) => [
      row._id.slice(-8).toUpperCase(),
      row.userId?.name || "N/A",
      row.restaurantId?.name || "N/A",
      row.paymentMethod,
      row.paymentGateway || "-",
      row.status,
      row.totalAmount,
      new Date(row.createdAt).toLocaleDateString("en-IN")
    ]);
    const content = [headers, ...rows].map((line) => line.join(",")).join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Payments exported successfully");
  };

  const printPage = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleSearch = () => {
    setFilters({ search: searchInput, page: 1 });
  };

  const handleRefund = async (amount: number, reason: string) => {
    if (!refundOrder) return;
    try {
      await processRefund(refundOrder._id, amount, reason);
      toast.success("Refund processed successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to process refund");
    }
  };

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeStatus} onValueChange={(value) => setSearchParams(value === "all" ? {} : { status: value })}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">Track all payment transactions and manage refunds</p>
          </div>
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="ACCEPTED">Accepted</TabsTrigger>
            <TabsTrigger value="PREPARING">Preparing</TabsTrigger>
            <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="rounded-3xl">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="rounded-3xl">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <IndianRupee className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-semibold">{currency.format(stats?.totalRevenue || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Settled Revenue
                  </p>
                  <p className="text-2xl font-semibold">{currency.format(stats?.settledRevenue || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pending COD
                  </p>
                  <p className="text-2xl font-semibold">{currency.format(stats?.pendingCOD || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-2xl bg-red-100 p-3 text-red-700">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Refunded
                  </p>
                  <p className="text-2xl font-semibold">{currency.format(stats?.refundedAmount || 0)}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Payment Activity</CardTitle>
            <CardDescription>View and manage all payment transactions</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full md:w-64 rounded-xl pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl">Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(columns).map(([key, visible]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={visible}
                    onCheckedChange={(value) => setColumns((current) => ({ ...current, [key]: value }))}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportCsv}>Export CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={printPage}>Export PDF (Print)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={printPage} className="rounded-xl">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 p-3">
            <span className="text-sm font-medium">Filters:</span>
            {paymentMethods.map((method) => (
              <Button
                key={method.value}
                variant={filters.method === method.value ? "default" : "ghost"}
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => {
                  setFilters({ method: method.value, page: 1 });
                }}
              >
                {method.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No payments found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columnsConfig.map((column) => (
                        <TableHead key={column.key} className={column.className}>
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((payment) => (
                      <TableRow key={payment._id} className="cursor-pointer" onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetailsModal(true);
                      }}>
                        {columnsConfig.map((column) => (
                          <TableCell key={column.key} onClick={(e) => {
                            if (column.key === "actions") {
                              e.stopPropagation();
                            }
                          }}>
                            {column.render(payment)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(filters.page - 1) * pageSize + 1}-
                  {Math.min(filters.page * pageSize, total)} of {total} payments
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters({ page: filters.page - 1 })}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {filters.page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters({ page: filters.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PaymentDetailsModal
        payment={selectedPayment}
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />

      <RefundModal
        order={refundOrder!}
        open={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onSubmit={handleRefund}
      />
    </div>
  );
}