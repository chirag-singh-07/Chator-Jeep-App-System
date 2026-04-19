"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  const [brand, setBrand] = useState("Chatori Jeep");
  const [supportEmail, setSupportEmail] = useState("ops@chatorijeep.com");
  const [autoAssign, setAutoAssign] = useState(true);
  const [refundAlerts, setRefundAlerts] = useState(true);

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
              toast.success("Settings saved.");
            }}
          >
            Save Preferences
          </Button>
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
    </div>
  );
}
