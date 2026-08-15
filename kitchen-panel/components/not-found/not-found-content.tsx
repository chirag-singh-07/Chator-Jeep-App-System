"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { MapsLocation01Icon, FireIcon } from "@hugeicons/core-free-icons";

export function NotFoundContent() {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-[600px] px-6 select-none font-sans">
      
      {/* Playful CSS empty plate illustration */}
      <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
        {/* Shadow */}
        <div className="absolute bottom-2 w-40 h-4 bg-zinc-950/5 dark:bg-black/20 rounded-full blur-xs" />
        
        {/* Outer Plate rim */}
        <div className="absolute w-44 h-44 rounded-full border-8 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center">
          {/* Inner Plate base */}
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-center">
            {/* Missing food outline with fork/knife shadows */}
            <div className="flex flex-col items-center gap-1.5 text-zinc-300 dark:text-zinc-600 animate-pulse">
              <span className="text-4xl">🍽️</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Empty Plate</span>
            </div>
          </div>
        </div>

        {/* Playful bite mark decoration */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-background rounded-full border-l-4 border-b-4 border-zinc-100 dark:border-zinc-800" />
      </div>

      {/* Text Copy */}
      <div className="space-y-4 mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
          <HugeiconsIcon icon={FireIcon} size={14} strokeWidth={2.5} />
          Error 404
        </span>
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground dark:text-zinc-50 leading-tight">
          Oops! This Plate Went Missing.
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Looks like the page you&apos;re hungry for doesn&apos;t exist. 
          <br />
          <span className="text-xs font-semibold text-primary mt-2 block">
            Don&apos;t worry, there&apos;s plenty of good food waiting for you.
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <Link href="/" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto rounded-full font-bold px-8 py-6 text-sm hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-primary/15">
            Back to Home
          </Button>
        </Link>
        <Link href="/#menu" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-bold px-8 py-6 text-sm border-primary/20 text-primary hover:bg-primary/5 transition-all">
            Explore Menu
          </Button>
        </Link>
      </div>
    </div>
  );
}
