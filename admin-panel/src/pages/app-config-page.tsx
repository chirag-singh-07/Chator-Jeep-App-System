import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Layout, Activity, Shield, Globe, Save, RefreshCw, Percent, Bike, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

export function AppConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    commissionPercentage: 10,
    deliveryBaseFee: 35,
    deliveryPerKmFee: 6,
    platformFixedFee: 0,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSettings();
      if (res.success) {
        setSettings(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key: string, value: any, label: string) => {
    try {
      setSaving(true);
      const res = await adminService.updateSetting({ key, value });
      if (res.success) {
        toast.success(`${label} updated successfully`);
      }
    } catch (error) {
      toast.error(`Failed to update ${label}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Config</h1>
          <p className="text-muted-foreground">Main system settings and revenue configuration.</p>
        </div>
        <Button onClick={fetchSettings} variant="outline" className="rounded-xl">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         {[
           { label: "Commission", value: `${settings.commissionPercentage}%`, icon: Percent, color: "text-blue-600", bg: "bg-blue-100" },
           { label: "Base Delivery", value: `₹${settings.deliveryBaseFee}`, icon: Bike, color: "text-emerald-600", bg: "bg-emerald-100" },
           { label: "Platform Fee", value: `₹${settings.platformFixedFee}`, icon: Wallet, color: "text-purple-600", bg: "bg-purple-100" },
         ].map((stat, i) => (
           <Card key={i} className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
             <CardContent className="pt-6 flex items-center gap-4">
                <div className={'h-12 w-12 rounded-2xl ' + stat.bg + ' flex items-center justify-center'}>
                   <stat.icon className={'h-6 w-6 ' + stat.color} />
                </div>
                <div>
                   <p className="text-xs text-muted-foreground font-bold uppercase">{stat.label}</p>
                   <p className="text-xl font-bold">{stat.value}</p>
                </div>
             </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Commission Settings</CardTitle>
            <CardDescription>Configure how much the platform earns from restaurant orders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform Commission (%)</label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={settings.commissionPercentage} 
                  onChange={(e) => setSettings({ ...settings, commissionPercentage: Number(e.target.value) })}
                  className="rounded-xl"
                />
                <Button 
                  onClick={() => handleSave("PLATFORM_COMMISSION_PERCENTAGE", settings.commissionPercentage, "Commission")}
                  disabled={saving}
                  className="rounded-xl"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Percentage taken from the food total (e.g. 10 means 10%).</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform Fixed Fee (₹)</label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={settings.platformFixedFee} 
                  onChange={(e) => setSettings({ ...settings, platformFixedFee: Number(e.target.value) })}
                  className="rounded-xl"
                />
                <Button 
                  onClick={() => handleSave("PLATFORM_FIXED_FEE", settings.platformFixedFee, "Platform Fee")}
                  disabled={saving}
                  className="rounded-xl"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Additional fixed charge per order.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Delivery Pricing</CardTitle>
            <CardDescription>Configure how delivery fees are calculated for customers and riders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Delivery Fee (₹)</label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={settings.deliveryBaseFee} 
                  onChange={(e) => setSettings({ ...settings, deliveryBaseFee: Number(e.target.value) })}
                  className="rounded-xl"
                />
                <Button 
                  onClick={() => handleSave("DELIVERY_BASE_FEE", settings.deliveryBaseFee, "Base Fee")}
                  disabled={saving}
                  className="rounded-xl"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Minimum fee for any delivery.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Per KM Fee (₹)</label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={settings.deliveryPerKmFee} 
                  onChange={(e) => setSettings({ ...settings, deliveryPerKmFee: Number(e.target.value) })}
                  className="rounded-xl"
                />
                <Button 
                  onClick={() => handleSave("DELIVERY_PER_KM_FEE", settings.deliveryPerKmFee, "Per KM Fee")}
                  disabled={saving}
                  className="rounded-xl"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Additional fee added per kilometer of distance.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm p-4">
        <CardHeader>
           <CardTitle>How it works</CardTitle>
           <CardDescription>Calculation logic for orders</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="bg-muted/30 p-6 rounded-2xl border border-muted space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Paid by Customer</span>
                <span className="font-bold">Food Total + Delivery Fee + Platform Fee</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Restaurant Earning</span>
                <span className="font-bold text-blue-600">Food Total - ({settings.commissionPercentage}% Commission)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Delivery Partner Earning</span>
                <span className="font-bold text-emerald-600">Full Delivery Fee</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="font-medium">Your Platform Earning</span>
                <span className="font-bold text-purple-600">Commission + Platform Fee</span>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
