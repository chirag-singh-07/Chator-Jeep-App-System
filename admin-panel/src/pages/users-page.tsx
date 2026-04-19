"use client";

import { useEffect, useState } from "react";
import { Plus, Search, RotateCcw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsersStore } from "@/stores/useUsersStore";
import type { UsersSubView } from "@/types/dashboard";

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { 
    users, 
    loading, 
    filters, 
    setFilters, 
    fetchUsers 
  } = useUsersStore();

  const activeTab = (searchParams.get("role") as UsersSubView | null) ?? "all";

  useEffect(() => {
    // Sync URL role to store
    setFilters({ 
      role: activeTab === "all" ? "ALL" : activeTab.toUpperCase(),
      page: 1
    });
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    fetchUsers();
  }, [filters.role, filters.search, filters.page, statusFilter]);

  const columns: DataColumn<any>[] = [
    { 
      key: "name", 
      label: "User Identity", 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-tight">{row._id}</span>
        </div>
      ) 
    },
    { key: "email", label: "Email Address", render: (row) => row.email },
    { key: "phone", label: "Contact", render: (row) => row.phone || "N/A" },
    { key: "role", label: "Permission Level", render: (row) => <StatusBadge value={row.role} /> },
    { 
      key: "status", 
      label: "Account Status", 
      render: (row) => <StatusBadge value={row.status || "ACTIVE"} /> 
    },
    { 
      key: "created", 
      label: "Onboarded", 
      render: (row) => (
        <span className="text-xs font-medium opacity-70">
          {new Date(row.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ) 
    },
    {
      key: "action",
      label: "Ops",
      render: (row) => (
        <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary rounded-xl">
          <Link to={`/users/${row._id}`}>View Profile</Link>
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={(value) => {
            setSearchParams(value === "all" ? {} : { role: value }, { replace: true });
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Filter by segment</label>
            <Button variant="ghost" size="sm" onClick={() => fetchUsers()} className="h-6 gap-2 text-[10px] uppercase font-bold tracking-tighter">
              <RotateCcw className="size-3" /> Sync List
            </Button>
          </div>
          <TabsList className="bg-secondary/20 p-1 rounded-2xl h-auto flex-wrap">
            <TabsTrigger value="all" className="rounded-xl px-5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">All Operators</TabsTrigger>
            <TabsTrigger value="admin" className="rounded-xl px-5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Administrators</TabsTrigger>
            <TabsTrigger value="delivery" className="rounded-xl px-5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Fleet Partners</TabsTrigger>
            <TabsTrigger value="kitchen" className="rounded-xl px-5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Kitchen Staff</TabsTrigger>
            <TabsTrigger value="user" className="rounded-xl px-5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Registered Users</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <FilterBar className="bg-card/40 border-0 shadow-sm p-4 rounded-3xl backdrop-blur-md">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or mobile number..."
            className="pl-10 h-12 bg-background/50 border-secondary/20 rounded-2xl"
            value={filters.search}
            onChange={(event) => {
              setFilters({ search: event.target.value, page: 1 });
            }}
          />
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <Select value={statusFilter} onValueChange={(val) => {
            setStatusFilter(val);
            setFilters({ page: 1 });
          }}>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active Only</SelectItem>
            <SelectItem value="DISABLED">Disabled Accounts</SelectItem>
            <SelectItem value="PENDING">Pending Review</SelectItem>
          </Select>
          <div className="h-8 w-px bg-secondary/20 mx-2 hidden md:block" />
          <Button asChild className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <Link to="/users/new/admin">
              <Plus className="size-4 mr-2" />
              New Operator
            </Link>
          </Button>
        </div>
      </FilterBar>

      {loading && users.length === 0 ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      ) : (
        <DataTable
          title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace`}
          description="Manage digital identities, permission scopes, and platform accessibility for this segment."
          columns={columns}
          rows={users}
          page={filters.page}
          pageSize={20}
          onPageChange={(page) => setFilters({ page })}
          emptyTitle="Workspace is Empty"
          emptyDescription="We couldn't find any users matching your criteria. Try widening your search or check other tabs."
          rowHref={(row) => `/users/${row._id}`}
          className="border-0 shadow-none bg-transparent"
        />
      )}
    </div>
  );
}
