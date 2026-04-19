"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useCategoryStore } from "@/stores/useCategoryStore";

export function CategoriesPage() {
  const { categories, loading, fetchCategories } = useCategoryStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const columns: DataColumn<any>[] = [
    { 
      key: "image", 
      label: "Visual", 
      render: (row) => (
        <div className="size-12 rounded-2xl bg-secondary/20 overflow-hidden border border-secondary/10 shadow-inner">
          {row.image ? (
            <img src={row.image} alt={row.name} className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center text-[10px] font-black uppercase text-muted-foreground/30">
              No Img
            </div>
          )}
        </div>
      ) 
    },
    { 
      key: "name", 
      label: "Category Details", 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black leading-none mt-1">
            slug: {row.slug}
          </span>
        </div>
      ) 
    },
    { 
      key: "order", 
      label: "Sort Order", 
      render: (row) => (
        <span className="tabular-nums font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
          Rank #{row.order || 0}
        </span>
      ) 
    },
    { 
      key: "status", 
      label: "Visibility", 
      render: (row) => <StatusBadge value={row.isActive ? "ACTIVE" : "DISABLED"} /> 
    },
    {
      key: "actions",
      label: "Operations",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 hover:text-primary transition-all">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl p-1.5 border-secondary/20 shadow-xl min-w-[160px]">
            <DropdownMenuItem className="rounded-xl flex gap-2 cursor-pointer py-2.5">
              <Edit2 className="size-3.5" />
              <span className="font-bold text-[13px]">Edit Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl flex gap-2 cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
              <Trash2 className="size-3.5" />
              <span className="font-bold text-[13px]">Delete Permanent</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Menu Taxonomy</h1>
          <p className="text-muted-foreground text-sm font-medium">Define and organize global categories used by all restaurants.</p>
        </div>
        <Button className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          <Plus className="size-4 mr-2" />
          Add Category
        </Button>
      </div>

      <FilterBar className="bg-card/40 border-0 shadow-sm p-4 rounded-[2rem] backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input
            placeholder="Search by category name or keyword..."
            className="pl-12 rounded-[1.25rem] bg-background/50 border-secondary/20 h-12"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-4">
          <Eye className="size-3.5" /> Showing {filteredCategories.length} Categories
        </div>
      </FilterBar>

      {loading && categories.length === 0 ? (
        <Skeleton className="h-[500px] rounded-[2.5rem]" />
      ) : (
        <DataTable
          title="Classification Matrix"
          description="Control platform visibility and sorting priority for food categories."
          columns={columns}
          rows={filteredCategories}
          emptyTitle="Taxonomy is Empty"
          emptyDescription="Start by defining your first food category to organize the global menu."
          className="border-0 shadow-none bg-transparent"
        />
      )}
    </div>
  );
}
