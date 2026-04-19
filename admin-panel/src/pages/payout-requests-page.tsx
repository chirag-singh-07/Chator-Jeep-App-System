
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Search, Filter, MoreVertical, Layout, Activity, Settings, Bell, Shield, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PayoutRequestsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payout Requests</h1>
          <p className="text-muted-foreground">Review and approve restaurant withdrawal requests.</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <Layout className="mr-2 h-4 w-4" /> Action
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         {[
           { label: "Overview", value: "840", icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
           { label: "Growth", value: "+12.5%", icon: Globe, color: "text-emerald-600", bg: "bg-emerald-100" },
           { label: "Status", value: "Active", icon: Shield, color: "text-purple-600", bg: "bg-purple-100" },
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

      <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm p-4">
        <CardHeader className="flex flex-row items-center justify-between">
           <div>
              <CardTitle>Management Console</CardTitle>
              <CardDescription>Configure and monitor latest updates</CardDescription>
           </div>
           <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl"><Search className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-xl"><Filter className="h-4 w-4" /></Button>
           </div>
        </CardHeader>
        <CardContent>
           <div className="h-96 rounded-2xl bg-muted/30 flex flex-col items-center justify-center border-2 border-dashed border-muted">
              <div className="h-16 w-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-4">
                 <CheckCircle className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Detailed view for Payout Requests is ready for integration</p>
              <Button variant="link" className="text-primary mt-2">Learn more about this module</Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
