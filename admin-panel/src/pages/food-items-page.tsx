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
import { formatCurrency } from "@/lib/format";
import type { FoodItemsSubView } from "@/types/dashboard";
import { useMenuStore } from "@/stores/useMenuStore";

export function FoodItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const activeTab =
    (searchParams.get("type") as FoodItemsSubView | null) ?? "all";

  const { foodItems, loading, filters, setFilters, fetchFoodItems } =
    useMenuStore();

  useEffect(() => {
    // Sync URL tab to store category
    setFilters({ page: 1 });
    setPage(1);
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    fetchFoodItems();
  }, [filters.search, filters.page, filters.status]);

  const rows = useMemo(() => {
    let result = [...foodItems];
    if (activeTab === "veg")
      result = result.filter((item) => item.isVeg === true);
    if (activeTab === "non-veg")
      result = result.filter((item) => item.isVeg === false);
    if (activeTab === "bestsellers")
      result = result.filter((item) => item.tags?.isBestseller === true);
    return result;
  }, [foodItems, activeTab]);

  const columns: DataColumn<any>[] = [
    { key: "name", label: "Item", render: (row) => row.name },
    {
      key: "category",
      label: "Category",
      render: (row) => row.category || "Uncategorized",
    },
    {
      key: "kitchen",
      label: "Kitchen",
      render: (row) => row.restaurantId?.name || "Unknown Kitchen",
    },
    {
      key: "type",
      label: "Type",
      render: (row) => <StatusBadge value={row.isVeg ? "Veg" : "Non-Veg"} />,
    },
    {
      key: "addons",
      label: "Add-ons",
      render: (row) => {
        const addons = row.addOns || [];
        return (
          <div className="flex flex-wrap gap-1">
            {addons.length ? (
              addons.slice(0, 2).map((addon: any, idx: number) => (
                <span
                  key={idx}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs"
                >
                  {addon.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No add-ons</span>
            )}
            {addons.length > 2 ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                +{addons.length - 2} more
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge value={row.isAvailable ? "Active" : "Inactive"} />
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (row) => formatCurrency(row.price),
    },
    {
      key: "date",
      label: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
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
          placeholder="Search item..."
          className="w-full md:max-w-sm"
          value={filters.search}
          onChange={(event) =>
            setFilters({ search: event.target.value, page: 1 })
          }
        />
        <div className="w-full md:w-44">
          <Select
            value={filters.status}
            onValueChange={(val) => setFilters({ status: val, page: 1 })}
          >
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
        page={filters.page}
        pageSize={20}
        onPageChange={(p) => setFilters({ page: p })}
        emptyTitle="No food items found"
        emptyDescription="Adjust the type tab, status filter, or search query."
      />
    </div>
  );
}
