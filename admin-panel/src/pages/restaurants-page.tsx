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
import { restaurantsSeed } from "@/data/dashboard-data";
import type { Restaurant, RestaurantsSubView } from "@/types/dashboard";

const pageSize = 6;

export function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const activeTab = (searchParams.get("type") as RestaurantsSubView | null) ?? "all";

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(timeout);
  }, [activeTab, statusFilter]);

  const rows = useMemo(() => {
    let result = [...restaurantsSeed];

    if (activeTab !== "all") {
      result = result.filter((restaurant) => restaurant.type === activeTab);
    }
    if (statusFilter !== "all") {
      result = result.filter((restaurant) => restaurant.status === statusFilter);
    }
    if (query.trim()) {
      const value = query.toLowerCase();
      result = result.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(value) ||
          restaurant.owner.toLowerCase().includes(value) ||
          restaurant.location.toLowerCase().includes(value)
      );
    }

    return result;
  }, [activeTab, query, statusFilter]);

  const columns: DataColumn<Restaurant>[] = [
    { key: "name", label: "Name", render: (row) => row.name },
    { key: "owner", label: "Owner", render: (row) => row.owner },
    { key: "type", label: "Type", render: (row) => <StatusBadge value={row.type === "active" ? "Open" : row.type === "closed" ? "Closed" : row.type === "requested" ? "Pending" : "Inactive"} /> },
    { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "rating", label: "Rating", render: (row) => (row.rating ? `${row.rating.toFixed(1)} / 5` : "--") },
    { key: "created", label: "Created", render: (row) => row.createdDate },
    {
      key: "action",
      label: "Details",
      render: (row) => (
        <Button variant="outline" size="sm" asChild>
          <Link to={`/restaurants/${row.id}`}>View Details</Link>
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
          setSearchParams(value === "all" ? {} : { type: value });
        }}
      >
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="all">All Restaurants</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
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
        description="Kitchen onboarding and performance management with subtype navigation like the Orders section."
        columns={columns}
        rows={rows}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyTitle="No restaurants found"
        emptyDescription="Try switching tabs or widening the search and status filters."
        rowHref={(row) => `/restaurants/${row.id}`}
      />
    </div>
  );
}
