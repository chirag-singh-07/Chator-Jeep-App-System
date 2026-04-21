"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, RotateCcw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRestaurantStore } from "@/stores/useRestaurantStore";

export function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    restaurants, 
    loading, 
    filters, 
    setFilters, 
    fetchRestaurants,
    counts 
  } = useRestaurantStore();

  const activeTab = searchParams.get("status") || "ALL";

  useEffect(() => {
    // Sync URL status to store
    setFilters({ 
      status: activeTab,
      page: 1
    });
  }, [activeTab, setFilters]);

  // We should fetch counts too, maybe dashboard store or a specific call.
  // For now we'll handle it inside fetchRestaurants in store or here.
  // I updated store fetchRestaurants to handle pagination.

  useEffect(() => {
    fetchRestaurants();
  }, [filters.status, filters.search, filters.page]);

  const columns: DataColumn<any>[] = [
    { key: "name", label: "Restaurant Name", render: (row) => (
      <div className="font-bold text-foreground">{row.name}</div>
    )},
    { key: "owner", label: "Owner", render: (row) => row.ownerName },
    { key: "email", label: "Email", render: (row) => row.email },
    { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "phone", label: "Phone", render: (row) => row.phone },
    { 
      key: "created", 
      label: "Joined", 
      render: (row) => new Date(row.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) 
    },
    {
      key: "action",
      label: "Review",
      render: (row) => (
        <Button variant="outline" size="sm" asChild className="rounded-xl border-secondary/30 hover:bg-primary/5 hover:border-primary/50 transition-all">
          <Link to={`/restaurants/${row._id}/review`}>Manage</Link>
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Restaurant Hub</h1>
          <p className="text-muted-foreground text-sm font-medium">Unified partner management for verification and lifecycle control.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="icon" onClick={() => fetchRestaurants()} className="rounded-xl text-muted-foreground hover:text-primary">
              <RotateCcw className="size-5" />
           </Button>
           <Button asChild className="rounded-xl shadow-lg ring-offset-2 hover:ring-2 ring-primary/20 transition-all">
            <Link to="/restaurants/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "All Hubs", value: "ALL", color: "text-slate-600", bg: "bg-slate-50/50" },
          { label: "Requested", value: "REQUESTED", color: "text-amber-600", bg: "bg-amber-50/50" },
          { label: "Verified", value: "ACTIVE", color: "text-emerald-600", bg: "bg-emerald-50/50" },
          { label: "Suspended", value: "CLOSED", color: "text-red-600", bg: "bg-red-50/50" },
          { label: "Flagged", value: "FLAGGED", color: "text-purple-600", bg: "bg-purple-50/50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-3xl border-0 p-5 shadow-sm backdrop-blur-md ${s.bg}`}>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{s.label}</p>
            <p className={`text-3xl font-black mt-2 tabular-nums ${s.color}`}>
               {loading && restaurants.length === 0 ? "—" : (counts[s.value] || 0)}
            </p>
          </div>
        ))}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setSearchParams(value === "ALL" ? {} : { status: value }, { replace: true });
        }}
      >
        <TabsList className="bg-muted/30 p-1.5 h-auto rounded-3xl w-full md:w-auto h-auto flex-wrap gap-1">
          <TabsTrigger value="ALL" className="rounded-2xl px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md">All Partners</TabsTrigger>
          <TabsTrigger value="REQUESTED" className="rounded-2xl px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md">New Requests</TabsTrigger>
          <TabsTrigger value="ACTIVE" className="rounded-2xl px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md">Verified</TabsTrigger>
          <TabsTrigger value="CLOSED" className="rounded-2xl px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md">Closed</TabsTrigger>
          <TabsTrigger value="FLAGGED" className="rounded-2xl px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md">Flagged</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar className="bg-card/40 border-0 shadow-sm p-4 rounded-3xl backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hub name, owner, or partner ID..."
            className="pl-10 rounded-2xl bg-background/50 border-secondary/20 h-12"
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value, page: 1 })}
          />
        </div>
        <Button variant="outline" className="rounded-2xl h-12 px-6 gap-2 border-secondary/20">
          <Filter className="h-4 w-4" /> Advanced Filter
        </Button>
      </FilterBar>

      {loading && restaurants.length === 0 ? (
        <Skeleton className="h-[500px] rounded-[2rem]" />
      ) : (
        <DataTable
          title={`${activeTab === "ALL" ? "Global" : activeTab} Partner Directory`}
          description="Real-time operational overview of food service entities across the platform."
          columns={columns}
          rows={restaurants}
          page={filters.page}
          pageSize={10}
          onPageChange={(page) => setFilters({ page })}
          emptyTitle="No Hubs Found"
          emptyDescription="We couldn't find any entities matching your criteria. Try widening your search or check other tabs."
          rowHref={(row) => `/restaurants/${row._id}/review`}
          className="border-0 shadow-none bg-transparent"
        />
      )}
    </div>
  );
}
