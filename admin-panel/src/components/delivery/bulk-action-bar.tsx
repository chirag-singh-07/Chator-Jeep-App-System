"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, XCircle, AlertCircle, Download, X, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type BulkActionBarProps = {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onSuspend: () => void;
  onDelete: () => void;
  onExport: () => void;
  onClose: () => void;
  remarks: string;
  onRemarksChange: (remarks: string) => void;
  isLoading?: boolean;
};

export function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onSuspend,
  onDelete,
  onExport,
  onClose,
  remarks,
  onRemarksChange,
  isLoading = false,
}: BulkActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl">
        <div className="m-4 rounded-2xl border border-primary/30 bg-linear-to-r from-primary/10 to-primary/5 shadow-2xl shadow-primary/20 backdrop-blur-md">
          <div className="flex flex-col gap-4 p-4">
            {/* Top Row: Count and Close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {selectedCount} partner{selectedCount !== 1 ? "s" : ""} selected
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-lg h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons and Remarks */}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              {/* Remarks Input */}
              <Input
                value={remarks}
                onChange={(e) => onRemarksChange(e.target.value)}
                placeholder="Add admin notes (optional)..."
                className="rounded-lg"
              />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={onApprove}
                  disabled={isLoading}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={onReject}
                  disabled={isLoading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={onSuspend}
                  disabled={isLoading}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Suspend
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  onClick={onDelete}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Delete
                </Button>

                {/* More Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      disabled={isLoading}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={onExport}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem>Assign Reviewer</DropdownMenuItem>
                    <DropdownMenuItem>Send Message</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
