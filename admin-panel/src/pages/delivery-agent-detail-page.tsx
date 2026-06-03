import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/admin/status-badge";
import { useDeliveryPartnerStore, type PartnerStatus } from "@/stores/useDeliveryPartnerStore";
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Truck,
  User,
  XCircle,
} from "lucide-react";

const documentFields = [
  { label: "Aadhaar", key: "aadhaarPhoto" },
  { label: "PAN", key: "panPhoto" },
  { label: "Driving License", key: "drivingLicensePhoto" },
  { label: "Vehicle RC", key: "vehicleRcPhoto" },
  { label: "Bike Insurance", key: "bikeInsurancePhoto" },
  { label: "Profile Selfie", key: "profilePhoto" },
  { label: "Live Photo", key: "livePhoto" },
] as const;

export function DeliveryAgentDetailPage() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { partners, isLoading, fetchPartners, updateStatus } = useDeliveryPartnerStore();
  const [pendingStatus, setPendingStatus] = useState<PartnerStatus | null>(null);
  const [remarks, setRemarks] = useState("");

  const partner = useMemo(
    () => partners.find((item) => item._id === partnerId),
    [partners, partnerId],
  );

  useEffect(() => {
    if (!partner) {
      fetchPartners();
    }
  }, [fetchPartners, partner]);

  const documentItems = useMemo(() => {
    if (!partner) return [];
    const docs = partner.documents ?? {};
    return documentFields.map((field) => ({
      label: field.label,
      url: docs[field.key] as string | undefined,
    }));
  }, [partner]);

  const verifiedDocs = documentItems.filter((item) => item.url).length;
  const complianceScore = Math.floor((verifiedDocs / documentItems.length) * 100);

  const formatAddress = () => {
    if (!partner?.address) return "-";
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

  const handleStatusUpdate = async () => {
    if (!partner || !pendingStatus) return;
    await updateStatus(partner._id, pendingStatus, remarks);
    setRemarks("");
    setPendingStatus(null);
  };

  if (!partner && isLoading) {
    return (
      <div className="rounded-3xl border border-muted/20 bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Loading partner profile...</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="rounded-3xl border border-muted/20 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-2xl font-bold">Partner not found</h1>
          </div>
          <p className="text-sm text-muted-foreground">This delivery partner cannot be found. Try refreshing or navigating back to the list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            to="/delivery/agents"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Partners
          </Link>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{partner.fullName}</h1>
              <p className="text-sm text-muted-foreground">Delivery partner profile and compliance dashboard.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={partner.status.toUpperCase()} />
              <Badge variant="secondary">{partner.vehicleType}</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => fetchPartners()}
          >
            Refresh
          </Button>
          <Button
            asChild
            className="rounded-2xl"
          >
            <Link to="/delivery/agents/new">Add New Partner</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border border-muted/20 bg-background/80 shadow-lg">
            <CardContent className="grid gap-6">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                <div className="rounded-3xl bg-primary/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Compliance Score</p>
                  <p className="mt-4 text-4xl font-bold">{complianceScore}%</p>
                  <p className="text-sm text-muted-foreground">Verified documents and fleet readiness.</p>
                </div>
                <div className="rounded-3xl bg-secondary/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Onboarded</p>
                  <p className="mt-4 text-4xl font-bold">{new Date(partner.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  <p className="text-sm text-muted-foreground">Partner invited to the platform.</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-3xl border border-muted/10 bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Vehicle</p>
                  <p className="mt-3 text-lg font-semibold">{partner.vehicleType}</p>
                  <p className="text-sm text-muted-foreground">{partner.vehicleFuelType || "Petrol"}</p>
                </div>
                <div className="rounded-3xl border border-muted/10 bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Payout</p>
                  <p className="mt-3 text-lg font-semibold">{partner.payoutMethod === "UPI" ? "UPI" : "Bank"}</p>
                  <p className="text-sm text-muted-foreground">{partner.payoutMethod === "UPI" ? partner.upiId || "Not configured" : partner.bankDetails?.bankName || "Bank details pending"}</p>
                </div>
                <div className="rounded-3xl border border-muted/10 bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Verified Docs</p>
                  <p className="mt-3 text-4xl font-bold">{verifiedDocs}/{documentItems.length}</p>
                  <p className="text-sm text-muted-foreground">Remaining documents require review.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-muted/20 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Profile Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="flex flex-col gap-4 rounded-3xl bg-background/80 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-3xl overflow-hidden bg-slate-950 border border-muted/20">
                      <img
                        src={partner.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.fullName}`}
                        alt={partner.fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{partner.fullName}</p>
                      <p className="text-sm text-muted-foreground">Partner ID {partner.userId}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 text-primary">{partner.status.toUpperCase()}</Badge>
                    <Badge variant="secondary">{partner.vehicleType}</Badge>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 rounded-3xl bg-muted/10 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><User className="h-4 w-4" /> Contact</div>
                    <p className="font-semibold">{partner.phoneNumber}</p>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                  <div className="space-y-2 rounded-3xl bg-muted/10 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Address</div>
                    <p className="font-semibold">{formatAddress()}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-muted/10 bg-card p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Current Rating</p>
                  <p className="mt-3 text-3xl font-bold">4.8</p>
                  <p className="text-sm text-muted-foreground">Based on delivery timeliness and customer feedback.</p>
                </div>
                <div className="rounded-3xl border border-muted/10 bg-card p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Availability</p>
                  <p className="mt-3 text-3xl font-bold">Active</p>
                  <p className="text-sm text-muted-foreground">Ready for assignments in the selected service zone.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-muted/20 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Verification Documents</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {documentItems.map((document) => (
                  <div key={document.label} className="rounded-3xl border border-muted/10 bg-background/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{document.label}</p>
                      {document.url ? (
                        <Badge variant="default" className="bg-emerald-500 text-white">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Missing</Badge>
                      )}
                    </div>
                    {document.url ? (
                      <img src={document.url} alt={document.label} className="mt-4 h-40 w-full rounded-3xl object-cover" />
                    ) : (
                      <div className="mt-4 flex h-40 items-center justify-center rounded-3xl border border-dashed border-muted/40 bg-muted/10 text-sm text-muted-foreground">
                        Awaiting upload
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-muted/20 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Compliance Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-background/80 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <p>Partner documents should be reviewed before changing approval state.</p>
                </div>
              </div>
              {partner.adminRemarks ? (
                <div className="rounded-3xl border border-muted/10 bg-muted/10 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold">Last Remark</p>
                  <p>{partner.adminRemarks}</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-muted/20 bg-muted/5 p-4 text-sm text-muted-foreground">
                  No previous admin remarks available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-muted/20 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Update Partner Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button
                  variant={pendingStatus === "approved" ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setPendingStatus("approved")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button
                  variant={pendingStatus === "rejected" ? "destructive" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setPendingStatus("rejected")}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button
                  variant={pendingStatus === "blocked" ? "secondary" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setPendingStatus("blocked")}
                >
                  <Truck className="mr-2 h-4 w-4" /> Block
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Admin remarks</Label>
                <Input
                  id="remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add any notes for the partner review..."
                  className="rounded-3xl"
                />
              </div>
              <Button
                className="w-full rounded-3xl"
                disabled={!pendingStatus}
                onClick={handleStatusUpdate}
              >
                Confirm update
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
