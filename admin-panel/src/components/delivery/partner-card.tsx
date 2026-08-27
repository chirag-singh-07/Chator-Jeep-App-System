"use client";

import type { DeliveryPartner, PartnerStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PartnerCardProps = {
  partner: DeliveryPartner;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewDetails: (partner: DeliveryPartner) => void;
  onUpdateStatus: (id: string, status: PartnerStatus) => void;
};

export function PartnerCard({
  partner,
  isSelected,
  onSelect,
  onViewDetails,
  onUpdateStatus,
}: PartnerCardProps) {
  const isPending = partner.status === "pending";
  const isBlocked = partner.status === "blocked";
  const isRejected = partner.status === "rejected";
  const isApproved = partner.status === "approved";

  const verificationDocs = [
    { label: "Profile", status: partner.profilePhoto ? "completed" : "pending" },
    {
      label: "Docs",
      status: Object.keys(partner.documents || {}).length > 0 ? "completed" : "pending",
    },
    {
      label: "Vehicle",
      status: partner.documents?.vehicleRcPhoto ? "completed" : "pending",
    },
    {
      label: "Bank",
      status: partner.bankDetails?.accountHolderName ? "completed" : "pending",
    },
  ];

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl transition-all duration-300 transform-gpu",
        isPending &&
          "border-orange-300/60 bg-linear-to-br from-orange-50/60 to-orange-50/20 shadow-lg shadow-orange-200/20 hover:shadow-orange-300/40 hover:-translate-y-1 hover:border-orange-400/60",
        isApproved &&
          "border-emerald-200/50 bg-linear-to-br from-emerald-50/40 to-emerald-50/10 shadow-sm hover:shadow-emerald-200/40 hover:border-emerald-400/60 hover:-translate-y-1",
        isBlocked && "border-red-200/30 bg-red-50/30 opacity-75 grayscale-[0.2] hover:grayscale-0 hover:-translate-y-1",
        isRejected && "border-rose-200/30 bg-rose-50/30 opacity-60 grayscale-[0.5]",
        !isPending &&
          !isBlocked &&
          !isRejected &&
          "border-muted/30 bg-background/60 backdrop-blur-md shadow-xs hover:shadow-xl hover:border-primary/20 hover:-translate-y-1"
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(partner._id)}
              aria-label={`Select ${partner.fullName}`}
              className="mt-1.5 h-4 w-4 rounded border-muted/50 text-primary focus:ring-primary"
            />

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full bg-muted shadow-xs ring-2 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/40 ring-muted/30">
                  <img
                    src={
                      partner.profilePhoto ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.fullName}`
                    }
                    alt={partner.fullName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{partner.fullName}</p>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/80">
                    {partner.vehicleType || "Bike"}
                  </p>
                </div>
              </div>
            </div>

            <StatusBadge value={partner.status.toUpperCase()} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 hover:bg-muted/50 data-[state=open]:bg-muted/50">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-muted/20">
              <DropdownMenuItem onClick={() => onViewDetails(partner)}>View Details</DropdownMenuItem>
              <DropdownMenuSeparator />
              {isPending && (
                <>
                  <DropdownMenuItem onClick={() => onUpdateStatus(partner._id, "approved")}>
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(partner._id, "rejected")}>
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              {isApproved && (
                <DropdownMenuItem onClick={() => onUpdateStatus(partner._id, "blocked")}>
                  Suspend
                </DropdownMenuItem>
              )}
              {isBlocked && (
                <DropdownMenuItem onClick={() => onUpdateStatus(partner._id, "approved")}>
                  Unsuspend
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>Send Message</DropdownMenuItem>
              <DropdownMenuItem>View Activity</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/20 p-3 text-xs text-muted-foreground border border-muted/10">
          <div className="flex items-center gap-2 truncate">
            <Phone className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="truncate font-medium">{partner.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{partner.email}</span>
          </div>
          <div className="col-span-2 flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="truncate text-foreground/80">{partner.address?.city || "Location pending"}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          {verificationDocs.map((doc, idx) => (
            <div key={idx} className="flex-1">
              <div
                className={cn(
                  "flex h-7 items-center justify-center rounded-md text-[11px] font-semibold tracking-wide transition-all",
                  doc.status === "completed"
                    ? "bg-emerald-100/80 text-emerald-700 shadow-xs border border-emerald-200/50"
                    : "bg-muted/50 text-muted-foreground/70 border border-muted/20"
                )}
              >
                {doc.status === "completed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 drop-shadow-xs" />
                ) : (
                  <span>{doc.label.charAt(0)}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(partner.documents || {}).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(partner.documents || {})
              .slice(0, 3)
              .map(([key, value]) => (
                <Badge key={key} variant="outline" className="rounded-lg bg-muted/40 text-xs">
                  {key.toUpperCase()}
                  {value ? " ✓" : ""}
                </Badge>
              ))}
            {Object.keys(partner.documents || {}).length > 3 && (
              <Badge variant="outline" className="rounded-lg text-xs">
                +{Object.keys(partner.documents || {}).length - 3}
              </Badge>
            )}
          </div>
        )}

        {isPending && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-100/60 px-2.5 py-1.5 text-xs font-medium text-orange-700 animate-pulse">
            <Clock className="h-3.5 w-3.5" />
            Needs Review
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isPending ? (
            <>
              <Button
                size="sm"
                variant="default"
                className="h-8 flex-1 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all"
                onClick={() => onUpdateStatus(partner._id, "approved")}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 rounded-lg text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                onClick={() => onUpdateStatus(partner._id, "rejected")}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-full rounded-lg text-xs font-medium bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors group"
              onClick={() => onViewDetails(partner)}
            >
              View Details <ArrowRight className="ml-1.5 h-3.5 w-3.5 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
