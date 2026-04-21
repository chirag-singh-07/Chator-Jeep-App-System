import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/admin.service";
import { CreditCard, IndianRupee, Loader2, Search, Wallet } from "lucide-react";

type DeliveryPayout = {
  _id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string;
  processedAt?: string;
  createdAt: string;
  paymentMethod: {
    type: "BANK_ACCOUNT" | "UPI";
    upiId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  riderId: {
    name: string;
    email: string;
    phone?: string;
    status?: string;
  };
};

const statusOptions = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function DeliveryPayoutsPage() {
  const [payouts, setPayouts] = useState<DeliveryPayout[]>([]);
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("PENDING");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPayouts = async (nextStatus = status) => {
    setLoading(true);
    try {
      const response = await adminService.getDeliveryPayouts({
        status: nextStatus === "ALL" ? "ALL" : nextStatus,
      });
      setPayouts(response.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayouts(status);
  }, [status]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return payouts;

    return payouts.filter((item) =>
      [item.riderId?.name, item.riderId?.email, item.riderId?.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [payouts, search]);

  const totals = useMemo(() => {
    const pending = payouts.filter((item) => item.status === "PENDING");
    const approved = payouts.filter((item) => item.status === "APPROVED");

    return {
      totalRequests: payouts.length,
      pendingValue: pending.reduce((sum, item) => sum + item.amount, 0),
      approvedValue: approved.reduce((sum, item) => sum + item.amount, 0),
    };
  }, [payouts]);

  const processPayout = async (id: string, nextStatus: "APPROVED" | "REJECTED") => {
    const note =
      nextStatus === "REJECTED"
        ? window.prompt("Add a rejection note for the rider:", "Bank details need verification") ?? ""
        : window.prompt("Optional approval note:", "Approved for next settlement run") ?? "";

    setProcessingId(id);
    try {
      await adminService.processDeliveryPayout(id, {
        status: nextStatus,
        note: note || undefined,
      });
      await loadPayouts(status);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Payouts</h1>
          <p className="text-muted-foreground">
            Review rider payout requests separately from restaurant withdrawals.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option}
              variant={status === option ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setStatus(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Open Requests
              </p>
              <p className="text-2xl font-semibold">{totals.totalRequests}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pending Amount
              </p>
              <p className="text-2xl font-semibold">{currency.format(totals.pendingValue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Approved Amount
              </p>
              <p className="text-2xl font-semibold">{currency.format(totals.approvedValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Rider payout queue</CardTitle>
            <CardDescription>Approve or reject rider payout requests with a clear audit trail.</CardDescription>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search rider name, email or phone"
              className="rounded-xl pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex h-56 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading delivery payouts...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              No delivery payout requests match the current filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold">{item.riderId?.name ?? "Unknown rider"}</h3>
                      <Badge variant={item.status === "PENDING" ? "default" : "secondary"}>{item.status}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Requested {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount</p>
                        <p className="font-medium">{currency.format(item.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Contact</p>
                        <p className="font-medium">{item.riderId?.email}</p>
                        <p className="text-sm text-muted-foreground">{item.riderId?.phone ?? "No phone"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Method</p>
                        <p className="font-medium">{item.paymentMethod.type === "UPI" ? "UPI" : "Bank account"}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.paymentMethod.type === "UPI"
                            ? item.paymentMethod.upiId
                            : `${item.paymentMethod.bankName ?? ""} ${item.paymentMethod.accountNumber ? `· ****${item.paymentMethod.accountNumber.slice(-4)}` : ""}`.trim()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin note</p>
                        <p className="text-sm text-foreground">{item.adminNote || "No note added yet"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="rounded-xl"
                      disabled={item.status !== "PENDING" || processingId === item._id}
                      onClick={() => processPayout(item._id, "APPROVED")}
                    >
                      {processingId === item._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      disabled={item.status !== "PENDING" || processingId === item._id}
                      onClick={() => processPayout(item._id, "REJECTED")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
