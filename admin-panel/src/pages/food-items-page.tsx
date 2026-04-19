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
import { foodItemsSeed } from "@/data/dashboard-data";
import { formatCurrency } from "@/lib/format";
import type { FoodItem, FoodItemsSubView } from "@/types/dashboard";

export function FoodItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const activeTab = (searchParams.get("type") as FoodItemsSubView | null) ?? "all";

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(timeout);
  }, [activeTab, statusFilter]);

  const rows = useMemo(() => {
    let result = [...foodItemsSeed];
    if (activeTab === "veg") result = result.filter((item) => item.foodType === "Veg");
    if (activeTab === "non-veg") result = result.filter((item) => item.foodType === "Non-Veg");
    if (activeTab === "bestsellers") result = result.filter((item) => item.bestseller);
    if (statusFilter !== "all") result = result.filter((item) => item.status === statusFilter);
    if (query.trim()) {
      const value = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(value) ||
          item.category.toLowerCase().includes(value) ||
          item.kitchenName.toLowerCase().includes(value)
      );
    }
    return result;
  }, [activeTab, query, statusFilter]);

  const columns: DataColumn<FoodItem>[] = [
    { key: "name", label: "Item", render: (row) => row.name },
    { key: "category", label: "Category", render: (row) => row.category },
    { key: "kitchen", label: "Kitchen", render: (row) => row.kitchenName },
    { key: "type", label: "Type", render: (row) => <StatusBadge value={row.foodType} /> },
    {
      key: "addons",
      label: "Add-ons",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.addons.length ? (
            row.addons.slice(0, 2).map((addon) => (
              <span key={addon.id} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {addon.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No add-ons</span>
          )}
          {row.addons.length > 2 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">+{row.addons.length - 2} more</span>
          ) : null}
        </div>
      )
    },
    { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "price", label: "Price", render: (row) => formatCurrency(row.price) },
    { key: "date", label: "Created", render: (row) => row.createdDate }
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
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="veg">Veg</TabsTrigger>
          <TabsTrigger value="non-veg">Non-Veg</TabsTrigger>
          <TabsTrigger value="bestsellers">Bestsellers</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar>
        <Input
          placeholder="Search item, category, kitchen..."
          className="w-full md:max-w-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="w-full md:w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </Select>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <Link to="/food-items/new">
              <Plus data-icon="inline-start" />
              Add Food Item
            </Link>
          </Button>
        </div>
      </FilterBar>

      <DataTable
        title="Food Items"
        description="Reusable catalog grid for menu items across kitchens, categories, and optional add-ons like drinks or sides."
        columns={columns}
        rows={rows}
        page={page}
        pageSize={6}
        onPageChange={setPage}
        emptyTitle="No food items found"
        emptyDescription="Adjust the type tab, status filter, or search query."
      />
    </div>
  );
}
