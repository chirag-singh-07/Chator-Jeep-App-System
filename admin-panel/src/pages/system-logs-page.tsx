import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Activity, Terminal, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService } from "@/services/admin.service";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function SystemLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logType, setLogType] = useState<"system" | "cron">("system");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getLogs({ type: logType, lines: 100 });
      setLogs(data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [logType]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System & Cron Logs
          </h1>
          <p className="text-muted-foreground">
            Real-time audit trail of backend events and recurring jobs.
          </p>
        </div>
        <Button
          onClick={fetchLogs}
          className="rounded-xl shadow-lg shadow-primary/20"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          {
            label: "System Service",
            value: logType === "system" ? "Active" : "Running",
            icon: Activity,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            label: "Cron Jobs",
            value: logType === "cron" ? "Active" : "Scheduled",
            icon: Clock,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="rounded-3xl border-none shadow-lg bg-white/50 backdrop-blur-sm"
          >
            <CardContent className="pt-6 flex items-center gap-4">
              <div
                className={
                  "h-12 w-12 rounded-2xl " +
                  stat.bg +
                  " flex items-center justify-center"
                }
              >
                <stat.icon className={"h-6 w-6 " + stat.color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">
                  {stat.label}
                </p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm p-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Console Output</CardTitle>
            <CardDescription>Latest 100 log entries</CardDescription>
          </div>
          <Tabs
            value={logType}
            onValueChange={(val) => setLogType(val as "system" | "cron")}
          >
            <TabsList className="rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="system" className="rounded-lg px-4 py-1.5">
                <Terminal className="mr-2 h-4 w-4" /> System
              </TabsTrigger>
              <TabsTrigger value="cron" className="rounded-lg px-4 py-1.5">
                <Clock className="mr-2 h-4 w-4" /> Cron
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 shadow-inner overflow-hidden flex flex-col h-[500px]">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-zinc-800" />
                <Skeleton className="h-4 w-5/6 bg-zinc-800" />
                <Skeleton className="h-4 w-4/6 bg-zinc-800" />
              </div>
            ) : logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 font-mono text-sm">
                No logs available for {logType}.
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 font-mono text-xs space-y-1.5 custom-scrollbar pr-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-3 hover:bg-zinc-900/50 p-1 rounded"
                  >
                    <span className="text-zinc-500 whitespace-nowrap">
                      [{log.timestamp}]
                    </span>
                    <span
                      className={`font-bold whitespace-nowrap ${log.level === "ERROR" ? "text-red-400" : log.level === "WARN" ? "text-yellow-400" : "text-blue-400"}`}
                    >
                      [{log.level}]
                    </span>
                    <span className="text-zinc-300 break-all">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
