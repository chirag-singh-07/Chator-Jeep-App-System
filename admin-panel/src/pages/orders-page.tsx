"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/format";
import { useOrdersStore } from "@/stores/useOrdersStore";

const pageSize = 20;

type ColumnKey = "id" | "customer" | "kitchen" | "status" | "amount" | "date" | "actions";

const columnDefaults: Record<ColumnKey, boolean> = {
  id: true,
  customer: true,
  kitchen: true,
  status: true,
  amount: true,
  date: true,
  actions: true
};

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>(columnDefaults);
  
  const { orders, loading, filters, setFilters, fetchOrders } = useOrdersStore();
  const activeTab = searchParams.get("status") ?? "all";

  useEffect(() => {
    setFilters({ status: activeTab, page: 1 });
  }, [activeTab, setSearchParams, setFilters]);

  useEffect(() => {
    fetchOrders();
  }, [filters.status, filters.page, filters.search, fetchOrders]);

  const columnsConfig = useMemo(() => {
    const allColumns: Array<{ key: ColumnKey; column: DataColumn<any> }> = [
      { key: "id", column: { key: "_id", label: "Order ID", render: (row) => row._id } },
      { key: "customer", column: { key: "customer", label: "Customer", render: (row) => row.userId?.name || "N/A" } },
      { key: "kitchen", column: { key: "kitchen", label: "Kitchen", render: (row) => row.restaurantId?.name || "N/A" } },
      { key: "status", column: { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> } },
      { key: "amount", column: { key: "amount", label: "Amount", render: (row) => formatCurrency(row.totalAmount) } },
      { key: "date", column: { key: "date", label: "Date", render: (row) => new Date(row.createdAt).toLocaleDateString("en-IN") } },
      {
        key: "actions",
        column: {
          key: "actions",
          label: "Actions",
          render: (row) => (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/orders/${row._id}`}>View Details</Link>
            </Button>
          )
        }
      }
    ];

    return allColumns.filter((entry) => columns[entry.key]).map((entry) => entry.column);
  }, [columns]);

  const exportCsv = () => {
    const headers = ["Order ID", "Customer", "Kitchen", "Status", "Amount", "Date"];
    const rows = orders.map((row) => [row._id, row.userId?.name, row.restaurantId?.name, row.status, row.totalAmount, new Date(row.createdAt).toLocaleDateString("en-IN")]);
    const content = [headers, ...rows].map((line) => line.join(",")).join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders-export.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Orders exported for Excel.");
  };

  const printPage = () => {
    window.print();
    toast.success("Print dialog opened.");
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setSearchParams(value === "all" ? {} : { status: value }, { replace: true });
        }}
      >
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="ACCEPTED">Accepted</TabsTrigger>
          <TabsTrigger value="PREPARING">Preparing</TabsTrigger>
          <TabsTrigger value="READY">Ready</TabsTrigger>
          <TabsTrigger value="PICKED_UP">Picked Up</TabsTrigger>
          <TabsTrigger value="ARRIVED">Arrived</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar>
        <Input
          placeholder="Search by order id, customer, kitchen..."
          className="w-full md:max-w-sm"
          value={filters.search}
          onChange={(event) => {
            setFilters({ search: event.target.value, page: 1 });
          }}
        />
        <div className="w-full md:w-44">
          <Select value={filters.status} onValueChange={(val) => {
            setSearchParams(val === "all" ? {} : { status: val }, { replace: true });
          }}>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="PREPARING">Preparing</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="PICKED_UP">Picked Up</SelectItem>
            <SelectItem value="ARRIVED">Arrived</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </Select>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(columns).map(([key, visible]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={visible}
                  onCheckedChange={(value) => setColumns((current) => ({ ...current, [key]: value }))}
                >
                  {key}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download data-icon="inline-start" />
                Excel / PDF
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportCsv}>Export CSV for Excel</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  printPage();
                  toast.success("Use Save as PDF in the print dialog.");
                }}
              >
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={printPage}>
            <Printer data-icon="inline-start" />
            Print
          </Button>
        </div>
      </FilterBar>

      {loading && orders.length === 0 ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      ) : (
        <DataTable
          title="Orders List"
          description="Operational order queue with search, visibility controls, and printable export actions."
          columns={columnsConfig}
          rows={orders}
          page={filters.page}
          pageSize={pageSize}
          onPageChange={(page) => setFilters({ page })}
          emptyTitle="No orders found"
          emptyDescription="Try adjusting the status or date filters to widen the result set."
          rowHref={(row) => `/orders/${row._id}`}
        />
      )}
    </div>
  );
}
