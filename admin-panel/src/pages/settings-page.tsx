"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  const [brand, setBrand] = useState("Chatori Jeeb");
  const [supportEmail, setSupportEmail] = useState("ops@chatorijeeb.com");
  const [launchOfferFee, setLaunchOfferFee] = useState("299");
  const [standardFee, setStandardFee] = useState("499");
  const [launchCommission, setLaunchCommission] = useState("10");
  const [normalCommission, setNormalCommission] = useState("18");
  const [offerHours, setOfferHours] = useState("48");
  const [autoAssign, setAutoAssign] = useState(true);
  const [refundAlerts, setRefundAlerts] = useState(true);

  // Platform & Delivery Fees
  const [deliveryBaseFee, setDeliveryBaseFee] = useState("0");
  const [deliveryPerKmFee, setDeliveryPerKmFee] = useState("10");
  const [platformFixedFee, setPlatformFixedFee] = useState("0");
  const [platformFeePercentage, setPlatformFeePercentage] = useState("5");
  const [packagingFee, setPackagingFee] = useState("0");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminService.getSettings();
        if (res.success && res.data) {
          setDeliveryBaseFee(res.data.deliveryBaseFee?.toString() || "0");
          setDeliveryPerKmFee(res.data.deliveryPerKmFee?.toString() || "10");
          setPlatformFixedFee(res.data.platformFixedFee?.toString() || "0");
          setPlatformFeePercentage(res.data.platformFeePercentage?.toString() || "5");
          setPackagingFee(res.data.packagingFee?.toString() || "0");
        }
      } catch (error) {
        toast.error("Failed to fetch settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Workspace Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormField label="Brand Name">
            <Input value={brand} onChange={(event) => setBrand(event.target.value)} />
          </FormField>
          <FormField label="Support Email">
            <Input value={supportEmail} onChange={(event) => setSupportEmail(event.target.value)} />
          </FormField>
          <Button
            onClick={() => {
              void adminService.updateSetting({
                key: "RESTAURANT_REGISTRATION_PRICING",
                description: "Chatori Jeeb restaurant registration pricing and commission rules",
                value: {
                  launchOfferFee: Number(launchOfferFee),
                  standardFee: Number(standardFee),
                  launchCommissionPercentage: Number(launchCommission),
                  normalCommissionPercentage: Number(normalCommission),
                  offerWindowHours: Number(offerHours),
                  launchOfferActive: true,
                },
              });
              toast.success("Settings saved.");
            }}
          >
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Restaurant Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Launch Fee">
            <Input value={launchOfferFee} onChange={(event) => setLaunchOfferFee(event.target.value.replace(/\D/g, ""))} />
          </FormField>
          <FormField label="Standard Fee">
            <Input value={standardFee} onChange={(event) => setStandardFee(event.target.value.replace(/\D/g, ""))} />
          </FormField>
          <FormField label="Launch Commission %">
            <Input value={launchCommission} onChange={(event) => setLaunchCommission(event.target.value.replace(/[^0-9.]/g, ""))} />
          </FormField>
          <FormField label="Normal Commission %">
            <Input value={normalCommission} onChange={(event) => setNormalCommission(event.target.value.replace(/[^0-9.]/g, ""))} />
          </FormField>
          <FormField label="Offer Window Hours">
            <Input value={offerHours} onChange={(event) => setOfferHours(event.target.value.replace(/\D/g, ""))} />
          </FormField>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Operational Toggles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Auto-assign riders</p>
              <p className="text-sm text-muted-foreground">Dispatch riders automatically when an order is packed.</p>
            </div>
            <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
          </div>
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Refund alerts</p>
              <p className="text-sm text-muted-foreground">Push immediate alerts when refunds or payment disputes are opened.</p>
            </div>
            <Switch checked={refundAlerts} onCheckedChange={setRefundAlerts} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm xl:col-span-2">
        <CardHeader>
          <CardTitle>Platform & Delivery Fees</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Delivery Base Fee">
            <Input value={deliveryBaseFee} onChange={(e) => setDeliveryBaseFee(e.target.value.replace(/\D/g, ""))} />
          </FormField>
          <FormField label="Delivery Per KM Fee">
            <Input value={deliveryPerKmFee} onChange={(e) => setDeliveryPerKmFee(e.target.value.replace(/\D/g, ""))} />
          </FormField>
          <FormField label="Platform Fixed Fee">
            <Input value={platformFixedFee} onChange={(e) => setPlatformFixedFee(e.target.value.replace(/\D/g, ""))} />
          </FormField>
          <FormField label="Platform Fee Percentage (%)">
            <Input value={platformFeePercentage} onChange={(e) => setPlatformFeePercentage(e.target.value.replace(/[^0-9.]/g, ""))} />
          </FormField>
          <FormField label="Packaging Fee">
            <Input value={packagingFee} onChange={(e) => setPackagingFee(e.target.value.replace(/\D/g, ""))} />
          </FormField>
        </CardContent>
        <div className="p-6 pt-0 flex justify-end">
          <Button
            onClick={async () => {
              try {
                await Promise.all([
                  adminService.updateSetting({ key: "DELIVERY_BASE_FEE", value: Number(deliveryBaseFee) }),
                  adminService.updateSetting({ key: "DELIVERY_PER_KM_FEE", value: Number(deliveryPerKmFee) }),
                  adminService.updateSetting({ key: "PLATFORM_FIXED_FEE", value: Number(platformFixedFee) }),
                  adminService.updateSetting({ key: "PLATFORM_FEE_PERCENTAGE", value: Number(platformFeePercentage) }),
                  adminService.updateSetting({ key: "PACKAGING_FEE", value: Number(packagingFee) }),
                ]);
                toast.success("Platform fees updated successfully.");
              } catch (error) {
                toast.error("Failed to update fees.");
              }
            }}
          >
            Save Fees
          </Button>
        </div>
      </Card>
    </div>
  );
}
