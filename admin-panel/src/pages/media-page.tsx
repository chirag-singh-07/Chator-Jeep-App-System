import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Trash2, ExternalLink, HardDrive, Search, RefreshCcw } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function MediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await adminService.getMedia();
      // Filter for common image extensions
      const images = res.data.filter((file: any) => 
        /\.(webp|jpg|jpeg|png|gif)$/i.test(file.key)
      );
      setMedia(images);
    } catch (error) {
      toast.error("Failed to fetch cloud assets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm("Are you sure you want to permanently delete this asset from S3?")) return;
    
    try {
      await adminService.deleteMedia([key]);
      toast.success("Asset deleted from bucket");
      setMedia(media.filter(m => m.key !== key));
    } catch (error) {
      toast.error("Failed to delete asset");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cloud Assets</h1>
          <p className="text-muted-foreground">Manage and audit binaries stored in S3/Tigris buckets.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={fetchMedia} className="rounded-xl">
             <RefreshCcw className="mr-2 h-4 w-4" /> Sync
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
         {[
           { label: "Storage Used", value: "2.4 GB", icon: HardDrive, color: "text-blue-600", bg: "bg-blue-100" },
           { label: "Total Assets", value: media.length.toString(), icon: ImageIcon, color: "text-emerald-600", bg: "bg-emerald-100" },
         ].map((stat, i) => (
           <Card key={i} className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm">
             <CardContent className="pt-6 flex items-center gap-4">
                <div className={'h-12 w-12 rounded-2xl ' + stat.bg + ' flex items-center justify-center'}>
                   <stat.icon className={'h-6 w-6 ' + stat.color} />
                </div>
                <div>
                   <p className="text-xs text-muted-foreground font-bold uppercase">{stat.label}</p>
                   <p className="text-xl font-bold">{stat.value}</p>
                </div>
             </CardContent>
           </Card>
         ))}
      </div>

      <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden min-h-[600px]">
        <CardHeader className="border-b border-muted/30 pb-6 flex flex-row items-center justify-between">
           <div>
              <CardTitle>Bucket Explorer</CardTitle>
              <CardDescription>Viewing direct object stream from Tigris S3</CardDescription>
           </div>
           <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search object keys..." 
                className="w-full bg-muted/30 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/20"
              />
           </div>
        </CardHeader>
        <CardContent className="p-6">
           {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array(12).fill(0).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl" />
                ))}
             </div>
           ) : media.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 opacity-20">
                <ImageIcon className="h-20 w-20 mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">No Cloud Assets Detected</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {media.map((item, i) => (
                  <div key={i} className="group relative aspect-square rounded-2xl bg-muted overflow-hidden border border-muted-foreground/10 hover:border-primary/40 transition-all shadow-sm hover:shadow-xl">
                    <img src={item.url} alt={item.key} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                       <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full" onClick={() => handleDelete(item.key)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                       <a href={item.url} target="_blank" rel="noreferrer" className="p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors">
                          <ExternalLink className="h-4 w-4 text-white" />
                       </a>
                    </div>
                    
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 px-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                       <p className="text-[8px] text-white font-bold truncate tracking-tighter uppercase">{item.key.split('/').pop()}</p>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
