import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Search, Send, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export function NotificationsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    targetUserType: "ALL",
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await adminService.getBroadcastHistory();
      setHistory(res.data);
    } catch (error) {
      toast.error("Failed to fetch notification history");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!formData.title || !formData.body) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setSending(true);
      await adminService.sendBroadcast(formData);
      toast.success("Broadcast signals dispatched successfully");
      setFormData({ title: "", body: "", targetUserType: "ALL" });
      fetchHistory();
    } catch (error) {
      toast.error("Failed to dispatch broadcast");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Signal Broadcast
          </h1>
          <p className="text-muted-foreground">
            Broadcast push and SMS alerts across the system network.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Dispatch Terminal</CardTitle>
            <CardDescription>
              Compose a new system-wide alert signal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Signal Recipient(s)
              </Label>
              <Select
                value={formData.targetUserType}
                onValueChange={(v) =>
                  setFormData({ ...formData, targetUserType: v })
                }
              >
                <SelectItem value="ALL">Broad Frequency (Everyone)</SelectItem>
                <SelectItem value="USER">Customers Base</SelectItem>
                <SelectItem value="KITCHEN">Kitchen Nodes</SelectItem>
                <SelectItem value="DELIVERY">Delivery Fleet</SelectItem>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Signal Heading
              </Label>
              <Input
                placeholder="Enter notification title..."
                className="rounded-2xl border-muted/50 h-12"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Payload Data (Message)
              </Label>
              <Textarea
                placeholder="Enter message content..."
                className="rounded-2xl border-muted/50 min-h-[120px] pt-3"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
              />
            </div>

            <Button
              className="w-full rounded-2xl bg-primary text-white font-bold h-14 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? "Transmitting..." : "DISPATCH SIGNAL"}
              {!sending && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-muted/30 pb-6">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Transmission Log
              </CardTitle>
              <CardDescription>
                Review latest broadcast frequency signals
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground font-medium animate-pulse">
                  Scanning frequencies...
                </div>
              ) : history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 p-12">
                  <Bell className="h-20 w-20 mb-4" />
                  <p className="font-bold uppercase tracking-widest text-xs">
                    No Signal Logs Detected
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-muted/30">
                  {history.map((notif, i) => (
                    <div
                      key={i}
                      className="p-6 hover:bg-white/40 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase">
                          {notif.targetUserType} Broadcast
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-slate-800 leading-tight mb-1">
                        {notif.title}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium line-clamp-2">
                        {notif.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
