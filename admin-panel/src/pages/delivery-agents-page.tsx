import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, Star, MoreVertical, Bike, Clock, TrendingUp, Mail, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeliveryPartnerStore, PartnerStatus } from "@/stores/useDeliveryPartnerStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeliveryAgentsPage() {
  const { partners, isLoading, fetchPartners, updateStatus } = useDeliveryPartnerStore();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [pendingStatus, setPendingStatus] = useState<PartnerStatus | null>(null);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleStatusUpdate = async () => {
    if (selectedPartner && pendingStatus) {
      await updateStatus(selectedPartner, pendingStatus, remarks);
      setSelectedPartner(null);
      setRemarks("");
      setPendingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Partners</h1>
          <p className="text-muted-foreground">Monitor and manage your fleet of delivery agents.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Partners", value: partners.length.toString(), icon: Bike, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Approved", value: partners.filter(p => p.status === 'approved').length.toString(), icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Pending", value: partners.filter(p => p.status === 'pending').length.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
          { label: "Rejected/Blocked", value: partners.filter(p => ['rejected', 'blocked'].includes(p.status)).length.toString(), icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
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
        {partners.map((partner) => (
          <Card key={partner._id} className="rounded-3xl border-none shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
            <div className={`h-2 w-full ${partner.status === 'approved' ? 'bg-emerald-500' : partner.status === 'pending' ? 'bg-orange-500' : 'bg-destructive'}`} />
            <CardHeader className="pb-3 border-b border-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.fullName}`} 
                      className="h-full w-full object-cover" 
                      alt={partner.fullName}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{partner.fullName}</CardTitle>
                    <StatusBadge value={partner.status.toUpperCase()} />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    {partner.status === 'pending' && (
                      <>
                        <DropdownMenuItem onClick={() => { setSelectedPartner(partner._id); setPendingStatus('approved'); }}>Approve</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedPartner(partner._id); setPendingStatus('rejected'); }}>Reject</DropdownMenuItem>
                      </>
                    )}
                    {partner.status === 'approved' && (
                      <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedPartner(partner._id); setPendingStatus('blocked'); }}>Block</DropdownMenuItem>
                    )}
                    {partner.status === 'blocked' && (
                      <DropdownMenuItem className="text-emerald-600" onClick={() => { setSelectedPartner(partner._id); setPendingStatus('approved'); }}>Unblock</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{partner.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{partner.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Bike className="h-4 w-4" />
                <span>{partner.vehicleType}</span>
              </div>
              
              {partner.adminRemarks && (
                <div className="mt-2 p-2 bg-muted/50 rounded-lg text-xs italic">
                  "{partner.adminRemarks}"
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{pendingStatus === 'approved' ? 'Approve' : pendingStatus === 'rejected' ? 'Reject' : 'Block'} Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Input
                id="remarks"
                placeholder="Add any internal remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPartner(null)}>Cancel</Button>
            <Button 
              className={pendingStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-destructive hover:bg-destructive/90'}
              onClick={handleStatusUpdate}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
