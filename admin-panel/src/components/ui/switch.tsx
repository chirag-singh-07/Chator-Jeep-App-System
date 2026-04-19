"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function Switch({ checked, onCheckedChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full border transition",
        checked ? "border-primary bg-primary/90" : "border-border bg-muted",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "ml-1 block size-5 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}
