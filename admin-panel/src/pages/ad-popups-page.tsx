"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { UploadDropzone } from "@/components/admin/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdPopupStore, type AdPopupRecord } from "@/stores/useAdPopupStore";

export function AdPopupsPage() {
  const { popups, loading, fetchPopups, createPopup, updatePopup, deletePopup } = useAdPopupStore();
  const [query, setQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingPopup, setEditingPopup] = useState<AdPopupRecord | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    type: "general",
    couponCode: "",
    isActive: true,
  });

  useEffect(() => {
    void fetchPopups();
  }, []);

  const filteredPopups = popups.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleOpenDialog = (popup?: AdPopupRecord) => {
    if (popup) {
      setEditingPopup(popup);
      setFormData({
        title: popup.title,
        imageUrl: popup.imageUrl,
        type: popup.type,
        couponCode: popup.couponCode || "",
        isActive: popup.isActive,
      });
    } else {
      setEditingPopup(null);
      setFormData({
        title: "",
        imageUrl: "",
        type: "general",
        couponCode: "",
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
      if (editingPopup) {
        await updatePopup(editingPopup._id, formData as Partial<AdPopupRecord>);
        toast.success("Ad Popup updated successfully.");
      } else {
        await createPopup(formData as Partial<AdPopupRecord>);
        toast.success("Ad Popup created successfully.");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save popup.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePopup(id);
      toast.success("Ad Popup deleted.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to delete popup.");
    }
  };

  const columns: DataColumn<AdPopupRecord>[] = [
    { 
      key: "imageUrl", 
      label: "Preview", 
      render: (row) => (
        <div className="w-20 h-20 rounded-xl bg-secondary/20 overflow-hidden border border-secondary/10 shadow-sm">
          <img src={row.imageUrl} alt={row.title} className="w-full h-full object-cover" />
        </div>
      ) 
    },
    { 
      key: "title", 
      label: "Content Details", 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-sm flex items-center gap-2">
            {row.title}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-black text-white mt-1 w-max ${row.type === 'new_user' ? 'bg-purple-500' : 'bg-blue-500'}`}>
            {row.type === 'new_user' ? 'NEW USER' : 'GENERAL'}
          </span>
        </div>
      ) 
    },
    { 
      key: "couponCode", 
      label: "Coupon Code", 
      render: (row) => (
        <span className="text-xs font-black text-primary uppercase">{row.couponCode || "NONE"}</span>
      ) 
    },
    { 
      key: "isActive", 
      label: "Status", 
      render: (row) => (
        <StatusBadge 
          value={row.isActive ? "ACTIVE" : "INACTIVE"} 
        />
      ) 
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenDialog(row)}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit Popup
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteId(row._id)}
              className="text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Popup
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Ad Popups</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Manage promotional popups that appear when users open the app.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Popup
        </Button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search popups..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-transparent focus-visible:bg-background"
            />
          </div>
        </div>

        <DataTable 
          title="Ad Popups"
          columns={columns} 
          rows={filteredPopups}
          page={1}
          pageSize={100}
          onPageChange={() => {}}
          emptyTitle="No popups found"
          emptyDescription="You have not created any popups yet."
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPopup ? 'Edit Popup' : 'Create Popup'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Popup Image</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-4">
                {formData.imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden h-40">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-40">
                    <UploadDropzone
                      onChange={(url: string) => setFormData({ ...formData, imageUrl: url })}
                      folder="popups"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="e.g. Welcome Offer!" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Popup Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                >
                  <SelectItem value="general">General Users</SelectItem>
                  <SelectItem value="new_user">New Users Only</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Coupon Code (Optional)</Label>
                <Input 
                  value={formData.couponCode} 
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })} 
                  placeholder="e.g. WELCOME100" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-xs text-muted-foreground">Will this popup be shown to users?</p>
              </div>
              <Switch 
                checked={formData.isActive} 
                onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingPopup ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!deleteId}
        onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
          setDeleteId(null);
        }}
        title="Delete Popup"
        description="Are you sure you want to delete this popup? This action cannot be undone."
      />
    </div>
  );
}
