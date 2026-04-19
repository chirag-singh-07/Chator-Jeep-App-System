import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ExternalLink,
  Download,
  Eye,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_KITCHEN = {
  id: "1",
  name: "Royal Spice Kitchen",
  ownerName: "Rahul Sharma",
  email: "rahul@royal.com",
  phone: "+91 98765 43210",
  cuisines: ["North Indian", "Mughlai", "Biryani"],
  status: "PENDING_VERIFICATION" as const,
  createdAt: "2026-04-18T10:30:00Z",
  city: "Noida",
  address: { line1: "Shop 14, Sector 62 Market", city: "Noida", state: "UP", pinCode: "201309" },
  fssaiLicense: "FSSAI/2024/NIA-12345",
  bankDetails: { accountHolderName: "Rahul Sharma", bankName: "HDFC Bank", ifscCode: "HDFC0001234", accountNumber: "XXXX XXXX 5678" },
  documents: [
    { label: "FSSAI License", key: "doc-1", url: "#", uploadedAt: "2026-04-18" },
    { label: "Owner Aadhar Card", key: "doc-2", url: "#", uploadedAt: "2026-04-18" },
    { label: "GST Certificate", key: "doc-3", url: "#", uploadedAt: "2026-04-18" },
  ],
  adminActions: [
    { action: "MARKED_FOR_REVIEW", reason: "Need clearer FSSAI document", timestamp: "2026-04-18T15:00:00Z", adminName: "Admin" },
  ],
  logoUrls: { thumbnail: "https://via.placeholder.com/80", medium: "https://via.placeholder.com/200" },
  bannerUrls: { medium: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" },
};

// ─── Rejection Modal ──────────────────────────────────────────────────────────
function RejectionModal({ onConfirm, onClose }: { onConfirm: (r: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const QUICK_REASONS = [
    "Invalid FSSAI License",
    "Blurry/illegible documents",
    "Mismatched owner information",
    "Incomplete bank details",
    "Duplicate registration",
  ];
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl shadow-2xl w-full max-w-md p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-red-100 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Reject Application</h3>
            <p className="text-xs text-muted-foreground">This will notify the kitchen owner.</p>
          </div>
        </div>
        <p className="text-sm font-medium mb-2">Select or type a reason</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_REASONS.map((r) => (
            <button key={r} onClick={() => setReason(r)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${reason === r ? "bg-red-500 text-white border-red-500" : "border-muted hover:border-red-300"}`}>
              {r}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          className="w-full rounded-xl border bg-muted/20 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
          placeholder="Or type a custom rejection reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancel</Button>
          <Button disabled={!reason.trim()} className="flex-1 rounded-xl bg-red-600 hover:bg-red-700" onClick={() => onConfirm(reason)}>
            Confirm Rejection
          </Button>
        </div>
      </div>
    </div>
  );
}

import { adminService } from "@/services/admin.service";
import { useParams, useNavigate } from "react-router-dom";

type KitchenStatus = "PENDING_VERIFICATION" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

// ─── Main Page ────────────────────────────────────────────────────────────────
export function KitchenReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kitchen, setKitchen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<"approved" | "rejected" | null>(null);

  const fetchKitchen = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await adminService.getKitchenById(id);
      if (response.success || response) {
        setKitchen(response.data || response);
      }
    } catch (error) {
      console.error("Failed to fetch kitchen:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchen();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminService.approveKitchen(id);
      setActionResult("approved");
      fetchKitchen();
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminService.rejectKitchen(id, reason);
      setActionResult("rejected");
      setShowRejectModal(false);
      fetchKitchen();
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReview = async () => {
     if (!id) return;
     setActionLoading(true);
     try {
       await adminService.markKitchenUnderReview(id, "Admin manually marked for review");
       fetchKitchen();
     } catch (error) {
       console.error("Review marker failed:", error);
     } finally {
       setActionLoading(false);
     }
  };

  if (loading || !kitchen) {
    return <Skeleton className="h-[600px] rounded-3xl" />;
  }

  const StatusBadge = () => {
    const cfg = {
      PENDING_VERIFICATION: { label: "Pending Review", icon: <Clock className="h-4 w-4" />, color: "text-amber-600 bg-amber-50 border-amber-200" },
      VERIFIED: { label: "Verified", icon: <CheckCircle className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
      REJECTED: { label: "Rejected", icon: <XCircle className="h-4 w-4" />, color: "text-red-600 bg-red-50 border-red-200" },
      UNDER_REVIEW: { label: "Under Review", icon: <Clock className="h-4 w-4" />, color: "text-blue-600 bg-blue-50 border-blue-200" },
    }[kitchen.status as KitchenStatus] || { label: "Unknown", icon: <Clock className="h-4 w-4" />, color: "text-gray-600 bg-gray-50 border-gray-200" };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl h-9 w-9" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Review Kitchen Application</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Submitted on {new Date(kitchen.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <StatusBadge />
      </div>

      {/* Success Banner */}
      {actionResult && (
        <div className={`rounded-2xl p-4 border flex items-center gap-3 ${actionResult === "approved" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          {actionResult === "approved" ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
          <p className="font-semibold text-sm">
            {actionResult === "approved" ? "Kitchen approved! The owner will be notified." : "Kitchen rejected. The owner has been notified with the reason."}
          </p>
        </div>
      )}

      {/* Banner Preview */}
      {kitchen.bannerUrls?.medium && (
        <div className="rounded-3xl overflow-hidden h-48 relative border shadow-sm">
          <img src={kitchen.bannerUrls.medium} alt="Kitchen Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            {kitchen.logoUrls?.thumbnail && (
              <div className="h-14 w-14 rounded-2xl border-2 border-white overflow-hidden bg-white shadow-lg">
                <img src={kitchen.logoUrls.thumbnail} alt="Logo" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="text-white">
              <p className="font-bold text-lg drop-shadow">{kitchen.name}</p>
              <p className="text-sm text-white/80">{kitchen.cuisines.join(" · ")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Business Info */}
          <div className="rounded-3xl border bg-white/60 backdrop-blur-sm shadow-sm p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Business Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: "Owner Name", value: kitchen.ownerName },
                { icon: Mail, label: "Email", value: kitchen.email },
                { icon: Phone, label: "Phone", value: kitchen.phone },
                { icon: MapPin, label: "Address", value: kitchen.address ? `${kitchen.address.line1}, ${kitchen.address.city} - ${kitchen.address.pinCode}` : "Not provided" },
                { icon: ShieldCheck, label: "FSSAI License", value: kitchen.fssaiLicense ?? "Not provided" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          <div className="rounded-3xl border bg-white/60 backdrop-blur-sm shadow-sm p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Bank Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Account Holder", value: kitchen.bankDetails?.accountHolderName || "N/A" },
                { label: "Bank Name", value: kitchen.bankDetails?.bankName || "N/A" },
                { label: "IFSC Code", value: kitchen.bankDetails?.ifscCode || "N/A" },
                { label: "Account Number", value: kitchen.bankDetails?.accountNumber || "N/A" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">{label}</p>
                  <p className="text-sm font-mono font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-3xl border bg-white/60 backdrop-blur-sm shadow-sm p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Uploaded Documents
            </h2>
            <div className="space-y-3">
              {kitchen.documents.map((doc) => (
                <div key={doc.key} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">Uploaded {doc.uploadedAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl h-8 gap-1 text-xs">
                      <Eye className="h-3 w-3" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl h-8 gap-1 text-xs">
                      <Download className="h-3 w-3" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          {kitchen.adminActions.length > 0 && (
            <div className="rounded-3xl border bg-white/60 backdrop-blur-sm shadow-sm p-5">
              <h2 className="font-bold text-base mb-4">Admin Action History</h2>
              <div className="space-y-3">
                {kitchen.adminActions.map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{act.action.replaceAll("_", " ")}</p>
                      {act.reason && <p className="text-xs text-muted-foreground">Reason: {act.reason}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(act.timestamp).toLocaleString()} · by {act.adminName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-5">
          <div className="rounded-3xl border bg-white/60 backdrop-blur-sm shadow-sm p-5 sticky top-4">
            <h2 className="font-bold text-base mb-1">Admin Actions</h2>
            <p className="text-xs text-muted-foreground mb-5">Your decision will notify the kitchen owner instantly.</p>

            {!actionResult ? (
              <div className="space-y-3">
                <button
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-emerald-700">Approve Kitchen</p>
                    <p className="text-xs text-emerald-600/70">Unlock full access & send notification</p>
                  </div>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => setShowRejectModal(true)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-red-700">Reject Application</p>
                    <p className="text-xs text-red-600/70">Provide a reason for rejection</p>
                  </div>
                </button>

                <button 
                  disabled={actionLoading}
                  onClick={handleMarkReview}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left disabled:opacity-50"
                >
                  <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-blue-700">Request More Info</p>
                    <p className="text-xs text-blue-600/70">Mark for further review</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className={`p-4 rounded-2xl text-center ${actionResult === "approved" ? "bg-emerald-50" : "bg-red-50"}`}>
                {actionResult === "approved" ? (
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                )}
                <p className="font-bold text-sm">Action Recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <RejectionModal
          onConfirm={handleReject}
          onClose={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
}
