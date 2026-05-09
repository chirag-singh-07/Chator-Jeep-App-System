"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Edit2, Trash2, Layout, Image as ImageIcon, ExternalLink, Filter } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBannerStore, type BannerRecord } from "@/stores/useBannerStore";

export function BannerAdsPage() {
  const { banners, loading, fetchBanners, createBanner, updateBanner, deleteBanner } = useBannerStore();
  const [query, setQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerRecord | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkType: "OFFER",
    linkId: "",
    priority: 0,
    isActive: true,
  });

  useEffect(() => {
    void fetchBanners();
  }, []);

  const filteredBanners = banners.filter(b => 
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    (b.subtitle && b.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  const handleOpenDialog = (banner?: BannerRecord) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || "",
        imageUrl: banner.imageUrl,
        linkType: banner.linkType,
        linkId: banner.linkId || "",
        priority: banner.priority,
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        subtitle: "",
        imageUrl: "",
        linkType: "OFFER",
        linkId: "",
        priority: 0,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast.error("Please fill required fields.");
      return;
    }

    try {
      if (editingBanner) {
        await updateBanner(editingBanner._id, formData as Partial<BannerRecord>);
        toast.success("Banner updated successfully.");
      } else {
        await createBanner(formData as Partial<BannerRecord>);
        toast.success("Banner created successfully.");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save banner.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await deleteBanner(id);
      toast.success("Banner deleted.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to delete banner.");
    }
  };

  const columns: DataColumn<BannerRecord>[] = [
    { 
      key: "imageUrl", 
      label: "Preview", 
      render: (row) => (
        <div className="w-32 h-16 rounded-xl bg-secondary/20 overflow-hidden border border-secondary/10 shadow-sm">
          <img src={row.imageUrl} alt={row.title} className="w-full h-full object-cover" />
        </div>
      ) 
    },
    { 
      key: "title", 
      label: "Content Details", 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-sm">{row.title}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
            {row.subtitle || "No Subtitle"}
          </span>
        </div>
      ) 
    },
    { 
      key: "linkType", 
      label: "Redirection", 
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-primary uppercase">{row.linkType}</span>
          {row.linkId && <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">ID: {row.linkId}</span>}
        </div>
      ) 
    },
    { 
      key: "priority", 
      label: "Rank", 
      render: (row) => (
        <span className="tabular-nums font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-xs">
          P#{row.priority}
        </span>
      ) 
    },
    { 
      key: "status", 
      label: "Status", 
      render: (row) => <StatusBadge value={row.isActive ? "ACTIVE" : "DISABLED"} /> 
    },
    {
      key: "actions",
      label: "Manage",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl min-w-[160px]">
            <DropdownMenuItem className="rounded-xl flex gap-2 cursor-pointer" onClick={() => handleOpenDialog(row)}>
              <Edit2 className="size-3.5" />
              <span className="font-bold text-[13px]">Edit Banner</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl flex gap-2 cursor-pointer text-red-600" onClick={() => handleDelete(row._id)}>
              <Trash2 className="size-3.5" />
              <span className="font-bold text-[13px]">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const [page, setPage] = useState(1);
  const pageSize = 10;

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Banners & Ads</h1>
          <p className="text-muted-foreground text-sm font-medium">Control the visual storytelling and promotions on the user app home screen.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20">
          <Plus className="size-4 mr-2" />
          Create New Ad
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card/40 border border-secondary/10 shadow-sm p-4 rounded-3xl backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input
            placeholder="Search banners by title or subtitle..."
            className="pl-12 rounded-2xl bg-background/50 border-secondary/20 h-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-2xl h-11 px-4 border-secondary/20 bg-background/50">
          <Filter className="size-4 mr-2" />
          Filters
        </Button>
      </div>

      {loading && banners.length === 0 ? (
        <Skeleton className="h-[400px] rounded-[2.5rem]" />
      ) : (
        <DataTable
          title="Campaign Active Matrix"
          description="High-priority banners are shown first in the user app carousel."
          columns={columns}
          rows={filteredBanners}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyTitle="No Campaigns Found"
          emptyDescription="Start your first advertising campaign by creating a home screen banner."
          className="border-0 shadow-none bg-transparent"
        />
      )}

      {/* Banner Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{editingBanner ? "Modify Campaign" : "New Campaign"}</DialogTitle>
            <DialogDescription className="font-medium">Define the visual and destination for this banner placement.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Banner Title*</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Flat 50% Off on Pizza"
                className="rounded-xl h-11 border-secondary/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="subtitle" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Applicable on all restaurants"
                className="rounded-xl h-11 border-secondary/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Image URL*</Label>
              <Input
                id="image"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                className="rounded-xl h-11 border-secondary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Action Link Type</Label>
                <Select 
                  value={formData.linkType} 
                  onValueChange={(v: any) => setFormData({ ...formData, linkType: v })}
                >
                  <SelectItem value="OFFER">General Offer</SelectItem>
                  <SelectItem value="RESTAURANT">Restaurant Link</SelectItem>
                  <SelectItem value="CATEGORY">Category Link</SelectItem>
                  <SelectItem value="EXTERNAL">External URL</SelectItem>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkId" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Target ID / URL</Label>
                <Input
                  id="linkId"
                  value={formData.linkId}
                  onChange={(e) => setFormData({ ...formData, linkId: e.target.value })}
                  placeholder="ID or URL"
                  className="rounded-xl h-11 border-secondary/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-secondary/10">
               <div className="flex flex-col gap-1">
                  <Label className="text-sm font-black">Active Visibility</Label>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Show this banner to users immediately</p>
               </div>
               <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} 
               />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Sorting Priority (Higher shows first)</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                className="rounded-xl h-11 border-secondary/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 px-8 font-bold border-secondary/20">Cancel</Button>
            <Button onClick={handleSubmit} className="rounded-xl h-11 px-8 font-black">
               {editingBanner ? "Save Changes" : "Deploy Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
