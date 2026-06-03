"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDeliveryPartnerStore, type PartnerStatus } from "@/stores/useDeliveryPartnerStore";
import type { DeliveryPartner } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartnerCard } from "@/components/delivery/partner-card";
import { AnalyticsStrip } from "@/components/delivery/analytics-strip";
import { StatusFilterTabs } from "@/components/delivery/status-filter-tabs";
import { BulkActionBar } from "@/components/delivery/bulk-action-bar";
import { PartnerDetailsPanel } from "@/components/delivery/partner-details-panel";
import { Plus, Search, RotateCcw } from "lucide-react";


export function DeliveryAgentsPage() {
  const { partners, isLoading, fetchPartners, updateStatus } =
    useDeliveryPartnerStore();
  const [searchParams] = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all");
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [bulkRemarks, setBulkRemarks] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Fetch partners on mount
  useEffect(() => {
    if (partners.length === 0) {
      fetchPartners();
    }
  }, []);

  // Filter partners based on search and status
  const filteredPartners = useMemo(() => {
    let filtered = partners;

    // Filter by status tab
    if (activeTab !== "all") {
      if (activeTab === "high-risk") {
        filtered = filtered.filter((p) => p.status === "blocked" || p.status === "rejected");
      } else {
        filtered = filtered.filter((p) => p.status === activeTab);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.phoneNumber.includes(query) ||
          p.address?.city?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [partners, activeTab, searchQuery]);

  // Handle partner selection
  const togglePartnerSelection = (id: string) => {
    setSelectedPartnerIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedPartnerIds(
      selectedPartnerIds.length === filteredPartners.length
        ? []
        : filteredPartners.map((p) => p._id)
    );
  };

  // Bulk actions
  const handleBulkUpdate = async (status: PartnerStatus) => {
    if (selectedPartnerIds.length === 0) return;
    setBulkLoading(true);

    try {
      for (const partnerId of selectedPartnerIds) {
        await updateStatus(partnerId, status, bulkRemarks);
      }
      setSelectedPartnerIds([]);
      setBulkRemarks("");
      await fetchPartners();
    } finally {
      setBulkLoading(false);
    }
  };

  // Handle details panel
  const handleViewDetails = (partner: DeliveryPartner) => {
    setSelectedPartner(partner);
    setIsDetailsPanelOpen(true);
  };

  const handleStatusChange = async (id: string, status: PartnerStatus, remarks?: string) => {
    await updateStatus(id, status, remarks);
    await fetchPartners();
    setIsDetailsPanelOpen(false);
    setSelectedPartner(null);
  };

  const handleUpdateStatus = async (id: string, status: PartnerStatus) => {
    await updateStatus(id, status);
    await fetchPartners();
  };

  // Stats
  const stats = {
    total: partners.length,
    approved: partners.filter((p) => p.status === "approved").length,
    pending: partners.filter((p) => p.status === "pending").length,
    rejected: partners.filter((p) => p.status === "rejected").length,
    blocked: partners.filter((p) => p.status === "blocked").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar - Sticky */}
      <div className="sticky top-0 z-30 border-b border-muted/10 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          {/* Left: Title and Badge */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">Delivery Fleet</h1>
              <p className="text-xs text-muted-foreground">
                {stats.total} partners • {stats.approved} active
              </p>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-100/60 px-2.5 py-1 sm:flex">
              <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Live</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search partners..."
                className="pl-9 rounded-full bg-muted/30 border-muted/20"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPartners()}
              className="rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
            <Button size="sm" asChild className="rounded-full">
              <Link to="/delivery/agents/new">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Add Partner</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Analytics Strip */}
        <AnalyticsStrip partners={partners} />

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <StatusFilterTabs
            partners={partners}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Partner Grid */}
        <div className="space-y-4">
          {selectedPartnerIds.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm">
              <span className="font-medium">
                {selectedPartnerIds.length} partner{selectedPartnerIds.length !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedPartnerIds([])}
                className="rounded-lg"
              >
                Clear
              </Button>
            </div>
          )}

          {filteredPartners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-muted/50 bg-muted/20 py-12 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                {isLoading ? "Loading partners..." : "No partners match your filters"}
              </p>
              {!isLoading && searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredPartners.map((partner) => (
                  <PartnerCard
                    key={partner._id}
                    partner={partner}
                    isSelected={selectedPartnerIds.includes(partner._id)}
                    onSelect={togglePartnerSelection}
                    onViewDetails={handleViewDetails}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>

              {/* Results count */}
              <div className="pt-4 text-center text-xs text-muted-foreground">
                Showing {filteredPartners.length} of {partners.length} partners
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedPartnerIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedPartnerIds.length}
          remarks={bulkRemarks}
          onRemarksChange={setBulkRemarks}
          onApprove={() => handleBulkUpdate("approved")}
          onReject={() => handleBulkUpdate("rejected")}
          onSuspend={() => handleBulkUpdate("blocked")}
          onExport={() => {
            console.log("Export selected partners");
          }}
          onClose={() => setSelectedPartnerIds([])}
          isLoading={bulkLoading}
        />
      )}

      {/* Partner Details Panel */}
      <PartnerDetailsPanel
        partner={selectedPartner}
        isOpen={isDetailsPanelOpen}
        onClose={() => {
          setIsDetailsPanelOpen(false);
          setSelectedPartner(null);
        }}
        onUpdateStatus={handleStatusChange}
        isLoading={bulkLoading}
      />
    </div>
  );
}
