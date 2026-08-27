"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useDeliveryPartnerStore, type PartnerStatus } from "@/stores/useDeliveryPartnerStore";
import type { DeliveryPartner } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/admin/status-badge";
import { AnalyticsStrip } from "@/components/delivery/analytics-strip";
import { StatusFilterTabs } from "@/components/delivery/status-filter-tabs";
import { BulkActionBar } from "@/components/delivery/bulk-action-bar";
import { Plus, Search, RotateCcw, MoreVertical, Trash2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";


export function DeliveryAgentsPage() {
  const { partners, isLoading, fetchPartners, updateStatus, deletePartner, deleteBulkPartners } =
    useDeliveryPartnerStore();
  const [searchParams] = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all");
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [bulkRemarks, setBulkRemarks] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleBulkDelete = async () => {
    if (selectedPartnerIds.length === 0) return;
    setBulkLoading(true);
    try {
      await deleteBulkPartners(selectedPartnerIds);
      setSelectedPartnerIds([]);
      setBulkRemarks("");
      // refetch is not strictly required since store updates, but we can call it if needed
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSingleDelete = async (id: string) => {
    try {
      await deletePartner(id);
    } catch (error) {
      console.error("Failed to delete partner", error);
    }
  };

  // Handle details panel
  const handleViewDetails = (partner: DeliveryPartner) => {
    navigate(`/delivery/agents/${partner._id}`);
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
    <div className="min-h-screen bg-linear-to-br from-background via-muted/10 to-muted/30 pb-20">
      {/* Top Navbar - Sticky */}
      <div className="sticky top-0 z-30 border-b border-primary/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-xs transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          {/* Left: Title and Badge */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70 tracking-tight">
                Delivery Fleet
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                {stats.total} partners • <span className="text-emerald-500">{stats.approved} active</span>
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
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPartners()}
              className="rounded-full shadow-xs hover:shadow-sm transition-all bg-background/50 backdrop-blur-md border-primary/10 hover:border-primary/30"
            >
              <RotateCcw className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="hidden sm:inline ml-2 font-medium">Refresh</span>
            </Button>
            <Button size="sm" asChild className="rounded-full shadow-md hover:shadow-lg transition-all bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:-translate-y-0.5">
              <Link to="/delivery/agents/new">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2 font-medium">Add Partner</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Analytics Strip */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both delay-75">
          <AnalyticsStrip partners={partners} />
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both delay-100">
          <StatusFilterTabs
            partners={partners}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Partner Grid */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both delay-150">
          {selectedPartnerIds.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm">
              <span className="font-medium text-primary">
                {selectedPartnerIds.length} partner{selectedPartnerIds.length !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedPartnerIds([])}
                className="rounded-lg hover:bg-primary/10 text-primary transition-colors"
              >
                Clear Selection
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
              <div className="rounded-xl border border-muted/20 bg-background/50 backdrop-blur-md shadow-xs overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[50px] pl-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-muted/50 text-primary focus:ring-primary"
                          checked={
                            selectedPartnerIds.length === filteredPartners.length &&
                            filteredPartners.length > 0
                          }
                          onChange={selectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow
                        key={partner._id}
                        data-state={selectedPartnerIds.includes(partner._id) ? "selected" : undefined}
                      >
                        <TableCell className="pl-4">
                          <input
                            type="checkbox"
                            checked={selectedPartnerIds.includes(partner._id)}
                            onChange={() => togglePartnerSelection(partner._id)}
                            aria-label={`Select ${partner.fullName}`}
                            className="h-4 w-4 rounded border-muted/50 text-primary focus:ring-primary"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-muted shadow-xs">
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
                              <p className="text-sm font-semibold text-foreground">
                                {partner.fullName}
                              </p>
                              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                {partner.vehicleType || "Bike"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="font-medium text-foreground">{partner.phoneNumber}</div>
                            <div>{partner.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {partner.address?.city || "Location pending"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={partner.status.toUpperCase()} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-muted/20">
                              <DropdownMenuItem onClick={() => handleViewDetails(partner)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {partner.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(partner._id, "approved")}>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(partner._id, "rejected")}>
                                    <XCircle className="mr-2 h-4 w-4 text-rose-600" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {partner.status === "approved" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(partner._id, "blocked")}>
                                  <AlertCircle className="mr-2 h-4 w-4 text-orange-600" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {partner.status === "blocked" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(partner._id, "approved")}>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                  Unsuspend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleSingleDelete(partner._id)}
                                className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
          onDelete={handleBulkDelete}
          onExport={() => {
            console.log("Export selected partners");
          }}
          onClose={() => setSelectedPartnerIds([])}
          isLoading={bulkLoading}
        />
      )}
    </div>
  );
}
