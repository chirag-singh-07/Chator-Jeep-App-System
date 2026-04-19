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
import { adminService } from "@/services/admin.service";
import type { User, UsersSubView } from "@/types/dashboard";

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeTab = (searchParams.get("role") as UsersSubView | null) ?? "all";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const roleMap = {
        admin: "ADMIN",
        delivery: "DELIVERY",
        kitchen: "KITCHEN",
        user: "USER"
      } as const;
      
      const role = activeTab !== "all" ? roleMap[activeTab as Exclude<UsersSubView, "all">] : undefined;
      
      const response = await adminService.getUsers({
        role,
        page,
        search: query || undefined
      });
      
      if (response.success) {
        setUsers(response.users);
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, page, query]);


  const columns: DataColumn<any>[] = [
    { key: "name", label: "Name", render: (row) => row.name },
    { key: "email", label: "Email", render: (row) => row.email },
    { key: "phone", label: "Phone", render: (row) => row.phone || "N/A" },
    { key: "role", label: "Role", render: (row) => <StatusBadge value={row.role} /> },
    { key: "created", label: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value="Active" /> // Defaulting to Active for now as backend doesn't have status yet
    },
    {
      key: "action",
      label: "Details",
      render: (row) => (
        <Button variant="outline" size="sm" asChild>
          <Link to={`/users/${row._id}`}>View Details</Link>
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
        rows={users}
        page={page}
        pageSize={6}
        onPageChange={setPage}
        emptyTitle="No users match these filters"
        emptyDescription="Adjust the role tab, status filter, or search query and try again."
        rowHref={(row) => `/users/${row._id}`}
      />
    </div>
  );
}
