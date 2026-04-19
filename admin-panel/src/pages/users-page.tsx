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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usersSeed } from "@/data/dashboard-data";
import type { User, UserStatus, UsersSubView } from "@/types/dashboard";

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState(usersSeed);
  const [loading, setLoading] = useState(true);

  const activeTab = (searchParams.get("role") as UsersSubView | null) ?? "all";

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(timeout);
  }, [activeTab, statusFilter]);

  const filteredUsers = useMemo(() => {
    let rows = [...users];
    if (activeTab !== "all") {
      const roleMap = {
        admin: "ADMIN",
        delivery: "DELIVERY",
        kitchen: "KITCHEN",
        user: "USER"
      } as const;
      rows = rows.filter((user) => user.role === roleMap[activeTab as Exclude<UsersSubView, "all">]);
    }
    if (statusFilter !== "all") {
      rows = rows.filter((user) => user.status === statusFilter);
    }
    if (query.trim()) {
      const value = query.toLowerCase();
      rows = rows.filter(
        (user) =>
          user.name.toLowerCase().includes(value) ||
          user.email.toLowerCase().includes(value) ||
          user.phone.toLowerCase().includes(value)
      );
    }
    return rows;
  }, [query, statusFilter, users, activeTab]);

  const columns: DataColumn<User>[] = [
    { key: "name", label: "Name", render: (row) => row.name },
    { key: "email", label: "Email", render: (row) => row.email },
    { key: "phone", label: "Phone", render: (row) => row.phone },
    { key: "role", label: "Role", render: (row) => <StatusBadge value={row.role} /> },
    { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "created", label: "Created", render: (row) => row.createdDate },
    {
      key: "toggle",
      label: "Active",
      render: (row) => (
        <Switch
          checked={row.status === "Active"}
          onCheckedChange={(checked) =>
            setUsers((current) =>
              current.map((user) =>
                user.id === row.id ? { ...user, status: (checked ? "Active" : "Inactive") as UserStatus } : user
              )
            )
          }
        />
      )
    },
    {
      key: "action",
      label: "Details",
      render: (row) => (
        <Button variant="outline" size="sm" asChild>
          <Link to={`/users/${row.id}`}>View Details</Link>
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
          setSearchParams(value === "all" ? {} : { role: value });
        }}
      >
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
          <TabsTrigger value="user">Customers</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar>
        <Input
          placeholder="Search name, email, phone..."
          className="w-full md:max-w-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </Select>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/users/new/admin">
              <Plus data-icon="inline-start" />
              New Admin
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/users/new/delivery">
              <Plus data-icon="inline-start" />
              New Delivery
            </Link>
          </Button>
        </div>
      </FilterBar>

      <DataTable
        title="Users List"
        description="All customer and operations-facing accounts with admin-only creation flows for admins and delivery users."
        columns={columns}
        rows={filteredUsers}
        page={page}
        pageSize={6}
        onPageChange={setPage}
        emptyTitle="No users match these filters"
        emptyDescription="Adjust the role tab, status filter, or search query and try again."
        rowHref={(row) => `/users/${row.id}`}
      />
    </div>
  );
}
