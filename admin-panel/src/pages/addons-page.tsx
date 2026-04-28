"use client";

import { useEffect, useState } from "react";
import { Search, MoreVertical, Layers, Info } from "lucide-react";
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
import axios from "axios";

export function AddonsPage() {
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      setLoading(true);
      // For Admin, we might need a "list all restaurant addons" endpoint
      // For now, using a placeholder or a basic fetch
      const response = await axios.get("http://localhost:5000/api/v1/addons/admin/all");
      if (response.data.success) {
        setAddons(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAddons = addons.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  const columns: DataColumn<any>[] = [
    { 
      key: "name", 
      label: "Customization Group", 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black leading-none mt-1">
            {row.options?.length || 0} variants
          </span>
        </div>
      ) 
    },
    { 
      key: "selection", 
      label: "Rules", 
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black bg-secondary/20 px-2 py-0.5 rounded-md border border-secondary/10 uppercase">
            Min: {row.minSelection}
          </span>
          <span className="text-[11px] font-black bg-secondary/20 px-2 py-0.5 rounded-md border border-secondary/10 uppercase">
            Max: {row.maxSelection}
          </span>
        </div>
      ) 
    },
    { 
      key: "status", 
      label: "State", 
      render: (row) => <StatusBadge value={row.isActive ? "ACTIVE" : "DISABLED"} /> 
    },
    {
      key: "actions",
      label: "Ops",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border-secondary/20">
            <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5">
              <Info className="size-3.5 mr-2" />
              <span className="font-bold text-[13px]">View Config</span>
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
          <h1 className="text-3xl font-black tracking-tight text-foreground">Menu Customization</h1>
          <p className="text-muted-foreground text-sm font-medium">Global view of all restaurant-specific addons and option groups.</p>
        </div>
      </div>

      <FilterBar className="bg-card/40 border-0 shadow-sm p-4 rounded-[2rem] backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input
            placeholder="Search variant groups..."
            className="pl-12 rounded-[1.25rem] bg-background/50 border-secondary/20 h-12"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-4">
          <Layers className="size-3.5" /> {filteredAddons.length} Customization Groups found
        </div>
      </FilterBar>

      {loading ? (
        <Skeleton className="h-[500px] rounded-[2.5rem]" />
      ) : (
        <DataTable
          title="Variant Definition Matrix"
          description="Monitoring all customization logic defined by partners."
          columns={columns}
          rows={filteredAddons}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyTitle="No Customization Found"
          emptyDescription="Currently no addons are registered in the system."
          className="border-0 shadow-none bg-transparent"
        />
      )}
    </div>
  );
}
