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
import { allOrders } from "@/data/dashboard-data";
import { formatCurrency } from "@/lib/format";
import type { OrderRow, OrdersSubView, OrderStatus } from "@/types/dashboard";

const pageSize = 6;
const subViewToStatus: Record<Exclude<OrdersSubView, "all">, OrderStatus> = {
  completed: "Completed",
  unassigned: "Unassigned",
  "out-for-delivery": "Out for Delivery",
  preparing: "Preparing",
  cancelled: "Cancelled"
};

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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>(columnDefaults);
  const [loading, setLoading] = useState(true);

  const activeTab = (searchParams.get("status") as OrdersSubView | null) ?? "all";

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timeout);
  }, [activeTab, statusFilter, dateFilter]);

  const filteredOrders = useMemo(() => {
    let rows = [...allOrders];

    if (activeTab !== "all") {
      rows = rows.filter((row) => row.status === subViewToStatus[activeTab as Exclude<OrdersSubView, "all">]);
    }
    if (statusFilter !== "all") {
      rows = rows.filter((row) => row.status === statusFilter);
    }
    if (dateFilter === "today") {
      rows = rows.filter((row) => row.date.startsWith("2026-04-19"));
    }
    if (query.trim()) {
      const value = query.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.id.toLowerCase().includes(value) ||
          row.customerName.toLowerCase().includes(value) ||
          row.kitchenName.toLowerCase().includes(value)
      );
    }

    return rows;
  }, [activeTab, statusFilter, dateFilter, query]);

  const columnsConfig = useMemo(() => {
    const allColumns: Array<{ key: ColumnKey; column: DataColumn<OrderRow> }> = [
      { key: "id", column: { key: "id", label: "Order ID", render: (row) => row.id } },
      { key: "customer", column: { key: "customer", label: "Customer", render: (row) => row.customerName } },
      { key: "kitchen", column: { key: "kitchen", label: "Kitchen", render: (row) => row.kitchenName } },
      { key: "status", column: { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> } },
      { key: "amount", column: { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) } },
      { key: "date", column: { key: "date", label: "Date", render: (row) => row.date } },
      {
        key: "actions",
        column: {
          key: "actions",
          label: "Actions",
          render: (row) => (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/orders/${row.id}`}>View Details</Link>
            </Button>
          )
        }
      }
    ];

    return allColumns.filter((entry) => columns[entry.key]).map((entry) => entry.column);
  }, [columns]);

  const exportCsv = () => {
    const headers = ["Order ID", "Customer", "Kitchen", "Status", "Amount", "Date"];
    const rows = filteredOrders.map((row) => [row.id, row.customerName, row.kitchenName, row.status, row.amount, row.date]);
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

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    );
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
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          <TabsTrigger value="preparing">Preparing</TabsTrigger>
          <TabsTrigger value="out-for-delivery">Out for Delivery</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar>
        <Input
          placeholder="Search by order id, customer, kitchen..."
          className="w-full md:max-w-sm"
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
        />
        <div className="w-full md:w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Unassigned">Unassigned</SelectItem>
            <SelectItem value="Preparing">Preparing</SelectItem>
            <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </Select>
        </div>
        <div className="w-full md:w-44">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">Lifetime</SelectItem>
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

      <DataTable
        title="Orders List"
        description="Operational order queue with search, visibility controls, and printable export actions."
        columns={columnsConfig}
        rows={filteredOrders}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyTitle="No orders found"
        emptyDescription="Try adjusting the status or date filters to widen the result set."
        rowHref={(row) => `/orders/${row.id}`}
      />
    </div>
  );
}
