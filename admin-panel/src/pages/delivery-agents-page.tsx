import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usersSeed } from "@/data/dashboard-data";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, Star, MoreVertical, Bike, Clock, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DeliveryAgentsPage() {
  const deliveryAgents = usersSeed.filter(u => u.role === "DELIVERY");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Partners</h1>
          <p className="text-muted-foreground">Monitor and manage your fleet of delivery agents.</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <User className="mr-2 h-4 w-4" /> Recruit New Partner
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Now", value: "84", icon: Bike, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "On Duty", value: "112", icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Avg Rating", value: "4.8", icon: Star, color: "text-orange-600", bg: "bg-orange-100" },
          { label: "Performance", value: "+12%", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-3xl border-none shadow-lg">
            <CardContent className="pt-6 flex items-center gap-4">
               <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {deliveryAgents.map((agent) => (
          <Card key={agent.id} className="rounded-3xl border-none shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
            <div className="h-2 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-3 border-b border-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`} 
                      className="h-full w-full object-cover" 
                      alt={agent.name}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <StatusBadge value={agent.status} />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Earnings</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{agent.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{agent.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{agent.addresses[0]?.address || "N/A"}</span>
              </div>
              
              <div className="pt-2 flex items-center justify-between border-t border-muted/50 pt-3">
                 <div className="flex items-center gap-1 text-orange-500">
                    <Star className="h-4 w-4 fill-orange-500" />
                    <span className="text-sm font-bold">4.9</span>
                 </div>
                 <div className="text-xs font-bold text-muted-foreground">
                    1,240 DELIVERIES
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Mail({ className }: { className?: string }) {
  return <User className={className} />; // Placeholder
}
