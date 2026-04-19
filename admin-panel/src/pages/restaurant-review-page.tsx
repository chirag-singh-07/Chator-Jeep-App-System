import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  ChevronLeft,
  Download,
  Eye,
  Flag,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useRestaurantStore } from "@/stores/useRestaurantStore";

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
            <p className="text-xs text-muted-foreground">This will notify the owner via the app.</p>
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export function RestaurantReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    selectedRestaurant: restaurant,
    loading,
    fetchRestaurantById,
    approveRestaurant,
    rejectRestaurant,
    flagRestaurant
  } = useRestaurantStore();

  useEffect(() => {
    if (id) {
      fetchRestaurantById(id);
    }
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveRestaurant(id);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleReject = async (reason: string) => {
    if (!id) return;
    try {
      await rejectRestaurant(id, reason);
      setShowRejectModal(false);
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  const handleFlag = async () => {
     if (!id) return;
     try {
       await flagRestaurant(id, "Flagged by admin for investigation");
     } catch (error) {
       console.error("Flag action failed:", error);
     }
  };

  if (loading || !restaurant) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 h rounded-3xl" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-96 col-span-2 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  const StatusBadge = () => {
    const config: Record<string, { label: string; icon: any; color: string }> = {
      REQUESTED: { label: "Verification Requested", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
      ACTIVE: { label: "Active & Verified", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
      REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
      CLOSED: { label: "Closed / Disabled", icon: XCircle, color: "text-gray-600 bg-gray-50 border-gray-200" },
      FLAGGED: { label: "Flagged / Suspend", icon: Flag, color: "text-purple-600 bg-purple-50 border-purple-200" },
    };
    const cfg = config[restaurant.status] || config.REQUESTED;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
        <Icon className="h-4 w-4" /> {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 bg-white shadow-sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Review Partner Application</h1>
            <p className="text-xs text-muted-foreground mt-0.5 uppercase font-bold tracking-widest">
              Submission ID: {restaurant._id?.slice(-8).toUpperCase()} · Joined {new Date(restaurant.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StatusBadge />
      </div>

      <div className="rounded-3xl h-56 relative overflow-hidden border-2 border-white shadow-xl bg-muted group">
        <img 
          src={restaurant.bannerUrls?.medium || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200"} 
          alt="Banner" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-2xl">
            <img 
               src={restaurant.logoUrls?.thumbnail || "https://via.placeholder.com/150"} 
               alt="Logo" 
               className="h-full w-full object-cover" 
            />
          </div>
          <div className="text-white">
            <p className="font-black text-2xl drop-shadow-md">{restaurant.name}</p>
            <p className="text-sm font-medium text-white/80 flex items-center gap-1.5">
               {restaurant.cuisines?.join(" · ") || "General Restaurant"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border bg-white/60 backdrop-blur-sm shadow-sm p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 bg-primary/5 rounded-full grayscale opacity-50" />
            <h2 className="font-black text-lg mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Entity Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: User, label: "Owner Name", value: restaurant.ownerName },
                { icon: Mail, label: "Business Email", value: restaurant.email },
                { icon: Phone, label: "Business Phone", value: restaurant.phone },
                { icon: MapPin, label: "Primary Address", value: restaurant.address ? `${restaurant.address.line1}, ${restaurant.address.city} - ${restaurant.address.pinCode}` : "Not provided" },
                { icon: ShieldCheck, label: "FSSAI ID", value: restaurant.fssaiLicense || "Pending submission" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-2xl border bg-white/40">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-bold mt-0.5 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-white/60 backdrop-blur-sm shadow-sm p-6">
            <h2 className="font-black text-lg mb-6 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Verification Documents
            </h2>
            <div className="space-y-3">
              {(restaurant.documents || []).length > 0 ? (
                restaurant.documents.map((doc: any) => (
                  <div key={doc.key} className="flex items-center justify-between p-4 rounded-2xl bg-white border group hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-black">{doc.label}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Uploaded on {doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString() : "Recent"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="rounded-xl h-9 w-9 p-0" asChild>
                         <a href={doc.url} target="_blank" rel="noreferrer"><Eye className="h-4 w-4" /></a>
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-xl h-9 w-9 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 rounded-2xl border-2 border-dashed bg-muted/20">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                    <p className="text-sm text-muted-foreground font-bold">No documents uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border bg-white/60 backdrop-blur-sm shadow-lg p-6 sticky top-4">
            <h2 className="font-black text-lg mb-1">Decision Module</h2>
            <p className="text-xs text-muted-foreground mb-6">Unified entity control for compliance and activation.</p>

            <div className="space-y-3">
              <button
                disabled={loading || restaurant.status === "ACTIVE"}
                onClick={handleApprove}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all text-left disabled:opacity-50 disabled:grayscale"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm text-emerald-900">Approve & Activate</p>
                  <p className="text-[10px] text-emerald-800/60 font-bold uppercase">Grant full platform access</p>
                </div>
              </button>

              <button
                disabled={loading || restaurant.status === "REJECTED"}
                onClick={() => setShowRejectModal(true)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-all text-left disabled:opacity-50 disabled:grayscale"
              >
                <div className="h-10 w-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm text-red-900">Reject Application</p>
                  <p className="text-[10px] text-red-800/60 font-bold uppercase">Request resubmission</p>
                </div>
              </button>

              <button
                disabled={loading || restaurant.status === "FLAGGED"}
                onClick={handleFlag}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 transition-all text-left disabled:opacity-50 disabled:grayscale"
              >
                <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-200">
                  <Flag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm text-purple-900">Flag Entity</p>
                  <p className="text-[10px] text-purple-800/60 font-bold uppercase">Mark for investigation</p>
                </div>
              </button>
            </div>

            {restaurant.adminActions?.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-4">Audit Trail</p>
                 <div className="space-y-4">
                    {restaurant.adminActions.slice().reverse().map((act: any, i: number) => (
                      <div key={i} className="flex gap-3">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                         <div>
                            <p className="text-xs font-bold leading-none">{act.action} <span className="text-muted-foreground font-medium">· {new Date(act.timestamp).toLocaleDateString()}</span></p>
                            {act.reason && <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{act.reason}</p>}
                         </div>
                      </div>
                    ))}
                 </div>
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
