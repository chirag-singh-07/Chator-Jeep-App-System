import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Building2,
  ChevronDown,
} from "lucide-react";

type KitchenStatus = "PENDING_VERIFICATION" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

interface KitchenRequest {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  cuisines: string[];
  status: KitchenStatus;
  createdAt: string;
  city: string;
  fssaiLicense?: string;
}

const MOCK_KITCHENS: KitchenRequest[] = [
  { id: "1", name: "Royal Spice Kitchen", ownerName: "Rahul Sharma", email: "rahul@royal.com", phone: "+91 98765 43210", cuisines: ["North Indian", "Mughlai"], status: "PENDING_VERIFICATION", createdAt: "2026-04-18", city: "Noida", fssaiLicense: "FSSAI/2024/NIA-12345" },
  { id: "2", name: "The Green Bowl", ownerName: "Priya Mehta", email: "priya@greenbowl.com", phone: "+91 87654 32109", cuisines: ["Salads", "Vegan"], status: "PENDING_VERIFICATION", createdAt: "2026-04-17", city: "Delhi" },
  { id: "3", name: "Burger Bros", ownerName: "Amit Patel", email: "amit@burgerbros.com", phone: "+91 76543 21098", cuisines: ["Burgers", "Continental"], status: "UNDER_REVIEW", createdAt: "2026-04-16", city: "Gurgaon", fssaiLicense: "FSSAI/2024/GRG-98765" },
  { id: "4", name: "Dosa Paradise", ownerName: "Sunita Rao", email: "sunita@dosa.com", phone: "+91 65432 10987", cuisines: ["South Indian"], status: "VERIFIED", createdAt: "2026-04-14", city: "Hyderabad" },
  { id: "5", name: "Midnight Munchies", ownerName: "Vikram Singh", email: "vikram@midnight.com", phone: "+91 54321 09876", cuisines: ["Fast Food", "Pizza"], status: "REJECTED", createdAt: "2026-04-13", city: "Mumbai" },
  { id: "6", name: "Zaffran Cloud Kitchen", ownerName: "Farid Khan", email: "farid@zaffran.com", phone: "+91 43210 98765", cuisines: ["Biryani", "Kebabs"], status: "PENDING_VERIFICATION", createdAt: "2026-04-19", city: "Lucknow", fssaiLicense: "FSSAI/2024/LKO-11111" },
];

const STATUS_TABS: { label: string; value: KitchenStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_VERIFICATION" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

const STATUS_CONFIG: Record<KitchenStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING_VERIFICATION: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: <Clock className="h-3.5 w-3.5" /> },
  UNDER_REVIEW: { label: "Under Review", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: <Filter className="h-3.5 w-3.5" /> },
  VERIFIED: { label: "Verified", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: <XCircle className="h-3.5 w-3.5" /> },
};

export function KitchenRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<KitchenStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const counts = {
    ALL: MOCK_KITCHENS.length,
    PENDING_VERIFICATION: MOCK_KITCHENS.filter((k) => k.status === "PENDING_VERIFICATION").length,
    UNDER_REVIEW: MOCK_KITCHENS.filter((k) => k.status === "UNDER_REVIEW").length,
    VERIFIED: MOCK_KITCHENS.filter((k) => k.status === "VERIFIED").length,
    REJECTED: MOCK_KITCHENS.filter((k) => k.status === "REJECTED").length,
  };

  const filtered = MOCK_KITCHENS.filter((k) => {
    const matchTab = activeTab === "ALL" || k.status === activeTab;
    const matchSearch =
      !search ||
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      k.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kitchen Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage kitchen partner onboarding applications.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2">
            <Filter className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Review", count: counts.PENDING_VERIFICATION, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Under Review", count: counts.UNDER_REVIEW, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Verified", count: counts.VERIFIED, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Rejected", count: counts.REJECTED, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search kitchens, owners, emails..."
            className="pl-10 rounded-xl bg-muted/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-muted/30 rounded-xl border">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.value
                  ? "bg-white shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-60">
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/20 border-b">
            <tr>
              {["Kitchen", "Owner", "City", "Cuisines", "FSSAI", "Submitted", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16 text-muted-foreground">
                  No kitchen requests found.
                </td>
              </tr>
            )}
            {filtered.map((k, i) => {
              const cfg = STATUS_CONFIG[k.status];
              return (
                <tr key={k.id} className={`border-b last:border-0 hover:bg-muted/10 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold truncate max-w-[140px]">{k.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{k.ownerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{k.city}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {k.cuisines.slice(0, 2).map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-muted/50 rounded-full text-[10px] font-medium">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                    {k.fssaiLicense ? (
                      <span className="text-emerald-600">✓ Present</span>
                    ) : (
                      <span className="text-red-400">✗ Missing</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{k.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color} ${cfg.bg}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl h-8 gap-1.5 text-xs"
                      onClick={() => navigate(`/kitchen-requests/${k.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Review
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
