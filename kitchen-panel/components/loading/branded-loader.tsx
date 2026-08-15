"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ChefHatIcon } from "@hugeicons/core-free-icons";

export function BrandedLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing background spinner */}
        <div className="absolute w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary motion-safe:animate-spin" />

        {/* Inner pulsing icon container */}
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/5 motion-safe:animate-pulse">
          <HugeiconsIcon icon={ChefHatIcon} size={22} strokeWidth={2.5} />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-heading text-lg font-black text-foreground dark:text-zinc-50 tracking-tight">
          Chatori Jeep Kitchen
        </h3>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          Preparing something delicious...
        </p>
      </div>
    </div>
  );
}
