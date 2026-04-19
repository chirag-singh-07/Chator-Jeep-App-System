import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, MessageSquare, Clock, Filter, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/status-badge";

export function SupportTicketsPage() {
  const tickets = [
    { id: "T-1001", user: "Riya Mehta", subject: "Refund for Order #CJ-12091", status: "Open", priority: "High", date: "10 mins ago" },
    { id: "T-1002", user: "Aman Gupta", subject: "Food quality issue", status: "In Progress", priority: "Medium", date: "2 hours ago" },
    { id: "T-1003", user: "Nikhil Rao", subject: "Delivery partner behavior", status: "Resolved", priority: "Low", date: "5 hours ago" },
    { id: "T-1004", user: "Muskan Arora", subject: "App login problem", status: "Open", priority: "Medium", date: "1 day ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage and resolve customer queries and complaints.</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <MessageSquare className="mr-2 h-4 w-4" /> New Ticket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         {[
           { label: "Total Open", value: "24", icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
           { label: "Avg Response", value: "14 min", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-100" },
           { label: "Satisfaction", value: "92%", icon: Headphones, color: "text-purple-600", bg: "bg-purple-100" },
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

      <Card className="rounded-3xl border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
           <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tickets..." className="pl-10 rounded-xl bg-muted/50 border-none" />
           </div>
           <Button variant="outline" className="rounded-xl"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                         <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <p className="font-bold">{ticket.subject}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ticket.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                               {ticket.priority}
                            </span>
                         </div>
                         <p className="text-xs text-muted-foreground">{ticket.user} • {ticket.id} • {ticket.date}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <StatusBadge value={ticket.status} />
                      <Button variant="ghost" size="sm" className="rounded-xl opacity-0 group-hover:opacity-100">Reply</Button>
                   </div>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
