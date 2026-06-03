"use client";

import type { DeliveryPartner, PartnerStatus } from "@/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { Select, SelectItem } from "@/components/ui/select";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PartnerDetailsPanelProps = {
  partner: DeliveryPartner | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: PartnerStatus, remarks?: string) => void;
  isLoading?: boolean;
};

const documentFields = [
  { label: "Aadhaar", key: "aadhaarPhoto" },
  { label: "PAN", key: "panPhoto" },
  { label: "Driving License", key: "drivingLicensePhoto" },
  { label: "Vehicle RC", key: "vehicleRcPhoto" },
  { label: "Bike Insurance", key: "bikeInsurancePhoto" },
  { label: "Profile Selfie", key: "profilePhoto" },
  { label: "Live Photo", key: "livePhoto" },
] as const;

export function PartnerDetailsPanel({
  partner,
  isOpen,
  onClose,
  onUpdateStatus,
  isLoading = false,
}: PartnerDetailsPanelProps) {
  const [statusChangeRemark, setStatusChangeRemark] = useState("");
  const [newStatus, setNewStatus] = useState<PartnerStatus | "">("");
  const [activeTab, setActiveTab] = useState("overview");

  if (!partner || !isOpen) return null;

  const documentItems = documentFields.map((field) => ({
    label: field.label,
    value: partner.documents?.[field.key],
  }));
  const verifiedDocCount = documentItems.filter((item) => Boolean(item.value)).length;

  const formatAddress = () => {
    if (!partner.address) return "Address not provided";

    return [
      partner.address.buildingName,
      partner.address.streetName,
      partner.address.landmark,
      partner.address.area,
      partner.address.city,
      partner.address.state,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    onUpdateStatus(partner._id, newStatus, statusChangeRemark || undefined);
    setNewStatus("");
    setStatusChangeRemark("");
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/30 transition-opacity" />

      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-background shadow-2xl transition-all duration-300">
        <div className="sticky top-0 z-50 border-b border-muted/20 bg-linear-to-b from-background to-background/80 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Partner Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 rounded-lg p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-2xl border border-muted/20 bg-linear-to-br from-muted/30 to-muted/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-muted ring-4 ring-muted/20 ring-offset-2 ring-offset-background">
                  <img
                    src={
                      partner.profilePhoto ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.fullName}`
                    }
                    alt={partner.fullName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{partner.fullName}</p>
                  <p className="text-sm text-muted-foreground">{partner.vehicleType || "Two Wheeler"}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge value={partner.status.toUpperCase()} />
                    <Badge variant="outline" className="rounded-lg">
                      Joined{" "}
                      {new Date(partner.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Compliance Score</p>
                <p className="text-3xl font-bold text-primary">
                  {Math.round((verifiedDocCount / Math.max(1, documentItems.length)) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 rounded-xl bg-muted/50">
              <TabsTrigger value="overview" className="rounded-lg">
                Overview
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-lg">
                Docs
              </TabsTrigger>
              <TabsTrigger value="performance" className="rounded-lg">
                Performance
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg">
                Activity
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-lg">
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="rounded-2xl border-muted/20">
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
                      <p className="mt-1 text-sm font-medium">{partner.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Phone</Label>
                      <p className="mt-1 text-sm font-medium">{partner.phoneNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-muted/20">
                <CardHeader>
                  <CardTitle className="text-base">Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>{formatAddress()}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-muted/20">
                <CardHeader>
                  <CardTitle className="text-base">Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Vehicle Type
                      </Label>
                      <p className="mt-1 text-sm font-medium">{partner.vehicleType}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Registration
                      </Label>
                      <p className="mt-1 text-sm font-medium">
                        {partner.documents?.vehicleRcNumber || "Pending"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-muted/20">
                <CardHeader>
                  <CardTitle className="text-base">Payout Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {partner.payoutMethod === "BANK_ACCOUNT" ? (
                    <>
                      <p className="font-medium">{partner.bankDetails?.accountHolderName || "No account holder"}</p>
                      <p className="text-muted-foreground">
                        {partner.bankDetails?.accountNumber
                          ? `•••• ${partner.bankDetails.accountNumber.slice(-4)}`
                          : "No account linked"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">UPI</p>
                      <p className="text-muted-foreground">{partner.upiId || "No UPI linked"}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {documentItems.map((doc) => (
                  <Card
                    key={doc.label}
                    className={cn(
                      "rounded-2xl border-muted/20 transition-all",
                      doc.value ? "border-emerald-200/30 bg-emerald-50/30" : "border-amber-200/30 bg-amber-50/30"
                    )}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-wide">{doc.label}</p>
                          <div className="mt-2 flex items-center gap-1.5 text-xs">
                            {doc.value ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Submitted</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-3.5 w-3.5 text-amber-600" />
                                <span className="text-amber-700">Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 w-8 rounded-lg p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card className="rounded-2xl border-muted/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Total Deliveries</p>
                      <p className="mt-1 text-2xl font-bold">--</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Avg Rating</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-2xl font-bold">4.8</p>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Acceptance Rate</p>
                      <p className="mt-1 text-2xl font-bold">98%</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Cancellation Rate</p>
                      <p className="mt-1 text-2xl font-bold">2%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-3">
              <Card className="rounded-2xl border-muted/20">
                <CardContent className="space-y-3 pt-4">
                  <div className="flex gap-3 border-b border-muted/20 pb-3">
                    <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(partner.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 border-b border-muted/20 pb-3">
                    <FileText className="h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium">Documents Submitted</p>
                      <p className="text-xs text-muted-foreground">{documentItems.filter((item) => item.value).length} documents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card className="rounded-2xl border-muted/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4" />
                    Admin Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {partner.adminRemarks ? (
                    <div className="rounded-lg bg-muted/40 p-3 text-sm">{partner.adminRemarks}</div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No notes added yet.</p>
                  )}
                </CardContent>
              </Card>

              {partner.status === "pending" && (
                <Card className="rounded-2xl border-orange-200/50 bg-orange-50/30">
                  <CardHeader>
                    <CardTitle className="text-base">Change Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        New Status
                      </Label>
                      <Select value={newStatus} onValueChange={(value) => setNewStatus(value as PartnerStatus | "")}>
                        <SelectItem value="">Select status</SelectItem>
                        <SelectItem value="approved">Approve</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                        <SelectItem value="blocked">Block</SelectItem>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Remark (Optional)
                      </Label>
                      <Input
                        value={statusChangeRemark}
                        onChange={(e) => setStatusChangeRemark(e.target.value)}
                        placeholder="Add a note for this status change..."
                        className="mt-2 rounded-lg"
                      />
                    </div>

                    <Button
                      onClick={handleStatusUpdate}
                      disabled={!newStatus || isLoading}
                      className="w-full rounded-lg"
                    >
                      {isLoading ? "Updating..." : "Update Status"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
