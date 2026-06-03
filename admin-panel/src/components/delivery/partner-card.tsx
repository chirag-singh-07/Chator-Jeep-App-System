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
        "overflow-hidden rounded-2xl transition-all duration-200",
        isPending &&
          "border-orange-300/60 bg-linear-to-br from-orange-50/50 to-orange-50/25 shadow-lg shadow-orange-200/30 hover:shadow-orange-300/40",
        isApproved &&
          "border-emerald-200/50 bg-linear-to-br from-emerald-50/30 to-emerald-50/10 hover:border-emerald-300/70",
        isBlocked && "border-red-200/30 bg-red-50/20 opacity-75",
        isRejected && "border-rose-200/30 bg-rose-50/20 opacity-60",
        !isPending &&
          !isBlocked &&
          !isRejected &&
          "border-muted/30 bg-background hover:border-muted/50"
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
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-muted ring-2 ring-offset-2 ring-offset-background ring-muted/30">
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
                  <p className="truncate text-sm font-semibold text-foreground">{partner.fullName}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {partner.vehicleType || "Bike"}
                  </p>
                </div>
              </div>
            </div>

            <StatusBadge value={partner.status.toUpperCase()} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
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

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{partner.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{partner.email}</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{partner.address?.city || "Location pending"}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          {verificationDocs.map((doc, idx) => (
            <div key={idx} className="flex-1">
              <div
                className={cn(
                  "flex h-6 items-center justify-center rounded-lg text-xs font-medium transition-all",
                  doc.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {doc.status === "completed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
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

        <div className="flex gap-2 pt-1">
          {isPending ? (
            <>
              <Button
                size="sm"
                variant="default"
                className="h-7 flex-1 rounded-lg text-xs"
                onClick={() => onUpdateStatus(partner._id, "approved")}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 flex-1 rounded-lg text-xs"
                onClick={() => onUpdateStatus(partner._id, "rejected")}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-full rounded-lg text-xs hover:bg-muted/60"
              onClick={() => onViewDetails(partner)}
            >
              View Details <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
