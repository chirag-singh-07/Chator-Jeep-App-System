"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { PhoneCall, FireIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { ScrollReveal } from "./scroll-reveal";
import Link from "next/link";

export function FinalCta() {
  const handleScrollToFeatures = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const elem = document.getElementById("features");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-zinc-950 dark:bg-zinc-950/60 text-white text-center">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10 opacity-60"></div>
      <div className="absolute bottom-0 left-1/3 -translate-x-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl -z-10 opacity-30"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-[800px]">
        <ScrollReveal animation="zoom-in" className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary">
              <HugeiconsIcon icon={FireIcon} size={16} strokeWidth={2.5} />
              Operational Efficiency
            </div>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Ready to Take Control of Your Restaurant?
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl font-medium tracking-tight">
              Manage orders, streamline your kitchen and keep your restaurant running smoothly from one powerful panel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full font-bold px-10 py-7 text-base bg-primary hover:bg-primary/80 border-none shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-transform duration-200 gap-2 group/btn animate-pulse"
              >
                Open Restaurant Panel
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={2.5} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            
            <button onClick={handleScrollToFeatures} className="w-full sm:w-auto cursor-pointer">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full font-bold px-10 py-7 text-base border-white/20 text-white hover:bg-white/5 hover:text-white transition-all hover:scale-105 active:scale-95 duration-200"
              >
                Explore Features
              </Button>
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
