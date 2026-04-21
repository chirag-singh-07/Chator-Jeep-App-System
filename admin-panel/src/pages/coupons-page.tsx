import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Plus,
  Timer,
  TrendingUp,
  Tag,
  Search,
  Filter,
  Trash2,
  Edit2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/status-badge";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import type { Coupon } from "@/types/dashboard";

export function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "0",
    maxDiscountAmount: "",
    expiryDate: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await adminService.getCoupons();
      setCoupons(res.data);
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.code || !formData.discountValue || !formData.expiryDate) {
        toast.error("Please fill all required fields");
        return;
      }

      await adminService.createCoupon({
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscountAmount: formData.maxDiscountAmount
          ? Number(formData.maxDiscountAmount)
          : undefined,
      });

      toast.success("Coupon created successfully");
      setIsDialogOpen(false);
      setFormData({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minOrderAmount: "0",
        maxDiscountAmount: "",
        expiryDate: "",
      });
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await adminService.deleteCoupon(id);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Promo Collections
          </h1>
          <p className="text-muted-foreground">
            Manage discount coupons and promotional offers.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" /> Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                New Coupon Protocol
              </DialogTitle>
              <DialogDescription>
                Initialize a new discount code for the network
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code" className="font-bold">
                  Protocol Code
                </Label>
                <Input
                  id="code"
                  placeholder="e.g. WELCOME100"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold">Type</Label>
                  <Select 
                    value={formData.discountType} 
                    onValueChange={(v) => setFormData({ ...formData, discountType: v })}
                  >
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value" className="font-bold">
                    Value
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="10"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="min" className="font-bold">
                    Min Order
                  </Label>
                  <Input
                    id="min"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiry" className="font-bold">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-2xl bg-primary text-white font-bold h-12"
              >
                Execute Creation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="h-48 rounded-3xl animate-pulse bg-muted"
              />
            ))
        ) : coupons.length === 0 ? (
          <Card className="col-span-full py-12 flex flex-col items-center justify-center bg-muted/30 border-dashed rounded-3xl">
            <Ticket className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="font-bold text-muted-foreground">
              No Active Coupons Found
            </p>
          </Card>
        ) : (
          coupons.map((coupon, i) => (
            <Card
              key={coupon._id}
              className="rounded-3xl border-none shadow-xl overflow-hidden group hover:shadow-2xl transition-all"
            >
              <div
                className={`h-2 w-full ${coupon.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              <CardContent className="pt-6 relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-rose-500 hover:bg-rose-50"
                    onClick={() => handleDelete(coupon._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-black tracking-tighter text-primary">
                      {coupon.code}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground">
                      {coupon.discountType === "PERCENTAGE"
                        ? "Percentage"
                        : "Flat"}{" "}
                      Offer
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-2xl bg-muted/50">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">
                        Discount
                      </p>
                      <p className="text-sm font-bold">
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                      </p>
                    </div>
                    <div className="p-2 rounded-2xl bg-muted/50">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">
                        Min Order
                      </p>
                      <p className="text-sm font-bold">
                        ₹{coupon.minOrderAmount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-muted/50">
                    <StatusBadge
                      value={coupon.isActive ? "Active" : "Disabled"}
                    />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      Exp: {new Date(coupon.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Usage Performance</CardTitle>
          <CardDescription>
            How your coupons are being redeemed (Live Feed)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-2 px-4">
            {[60, 45, 10, 55, 90, 70, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 hover:bg-primary rounded-t-xl transition-all"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground px-4">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
