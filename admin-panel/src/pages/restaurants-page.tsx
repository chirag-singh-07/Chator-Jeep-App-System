"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService } from "@/services/admin.service";
import type { KitchenStatus } from "@/types/dashboard";

const pageSize = 6;

export function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeTab = (searchParams.get("status") as string | null) ?? "all";

  const fetchKitchens = async () => {
    setLoading(true);
    try {
      const response = await adminService.getKitchens({
        status: activeTab !== "all" ? activeTab : undefined,
        page,
        search: query || undefined
      });
      
      if (response.success) {
        setKitchens(response.kitchens);
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch kitchens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, [activeTab, page, query]);

  const columns: DataColumn<any>[] = [
    { key: "name", label: "Name", render: (row) => row.name },
    { key: "owner", label: "Owner", render: (row) => row.ownerName },
    { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "phone", label: "Phone", render: (row) => row.phone },
    { key: "created", label: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: "action",
      label: "Details",
      render: (row) => (
        <Button variant="outline" size="sm" asChild>
          <Link to={`/kitchen-requests/${row._id}`}>Review</Link>
        </Button>
      )
    }
  ];

  if (loading) {
    return <Skeleton className="h-[420px] rounded-2xl" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setPage(1);
          setSearchParams(value === "all" ? {} : { status: value });
        }}
      >
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="all">All Kitchens</TabsTrigger>
          <TabsTrigger value="PENDING_VERIFICATION">Pending</TabsTrigger>
          <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          <TabsTrigger value="UNDER_REVIEW">Review</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar>
        <Input
          placeholder="Search kitchen, owner, location..."
          className="w-full md:max-w-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="w-full md:w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </Select>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <Link to="/restaurants/new">
              <Plus data-icon="inline-start" />
              Add Restaurant
            </Link>
          </Button>
        </div>
      </FilterBar>

      <DataTable
        title="Restaurants / Kitchens"
        description="Kitchen onboarding and performance management with status-based filtering."
        columns={columns}
        rows={kitchens}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyTitle="No restaurants found"
        emptyDescription="Try switching tabs or widening the search and status filters."
        rowHref={(row) => `/kitchen-requests/${row._id}`}
      />
    </div>
  );
}
