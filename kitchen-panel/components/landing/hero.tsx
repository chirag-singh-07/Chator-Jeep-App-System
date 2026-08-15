"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { FireIcon, DeliveryTruck01Icon, ChefHatIcon } from "@hugeicons/core-free-icons";

export function Hero() {
  const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById("features");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative overflow-hidden bg-radial from-amber-500/5 via-transparent to-transparent py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center space-y-8 lg:col-span-6 text-center lg:text-left">
            <div className="space-y-4">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary animate-fade-in-up"
                style={{ animationDelay: "150ms" }}
              >
                <HugeiconsIcon icon={FireIcon} size={16} strokeWidth={2.5} className="animate-bounce" />
                Restaurant Operations Panel
              </div>
              
              <h1
                className="font-heading text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-foreground dark:text-zinc-50 animate-fade-in-up"
                style={{ animationDelay: "350ms" }}
              >
                Run Your Restaurant.<br />
                <span className="text-primary relative inline-block">
                  Smarter. Faster. Better.
                  <span className="absolute left-0 bottom-1 w-full h-[6px] bg-primary/20 rounded-full animate-pulse"></span>
                </span>
              </h1>
              
              <p
                className="mx-auto lg:mx-0 max-w-[540px] text-base md:text-lg text-muted-foreground leading-relaxed animate-fade-in-up"
                style={{ animationDelay: "550ms" }}
              >
                Everything your restaurant needs to manage incoming orders, kitchen workflows, menu items and daily operations performance — all in one simple, unified control center.
              </p>
            </div>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up"
              style={{ animationDelay: "750ms" }}
            >
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full font-bold px-8 py-6 text-base shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform duration-200">
                  Access Restaurant Panel
                </Button>
              </Link>
              <a href="#features" onClick={handleScrollToFeatures} className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-bold px-8 py-6 text-base border-primary/30 text-primary hover:bg-primary/5 transition-all">
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Micro Badges */}
            <div
              className="grid grid-cols-3 gap-2 md:gap-4 pt-4 border-t max-w-[500px] mx-auto lg:mx-0 animate-fade-in-up"
              style={{ animationDelay: "950ms" }}
            >
              <div className="flex flex-col items-center lg:items-start gap-1 group/badge cursor-pointer">
                <div className="flex items-center gap-1.5 text-primary">
                  <HugeiconsIcon icon={ChefHatIcon} size={18} strokeWidth={2} className="group-hover/badge:rotate-12 transition-transform duration-300" />
                  <span className="font-bold text-sm md:text-base text-foreground dark:text-zinc-50">Kitchen Prep</span>
                </div>
                <span className="text-xs text-muted-foreground text-center lg:text-left">Live workflow track</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-1 group/badge cursor-pointer">
                <div className="flex items-center gap-1.5 text-primary">
                  <HugeiconsIcon icon={FireIcon} size={18} strokeWidth={2} className="group-hover/badge:scale-110 transition-transform duration-300" />
                  <span className="font-bold text-sm md:text-base text-foreground dark:text-zinc-50">Menu Updates</span>
                </div>
                <span className="text-xs text-muted-foreground text-center lg:text-left">Instant item toggles</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-1 group/badge cursor-pointer">
                <div className="flex items-center gap-1.5 text-primary">
                  <HugeiconsIcon icon={DeliveryTruck01Icon} size={18} strokeWidth={2} className="group-hover/badge:translate-x-1 transition-transform duration-300" />
                  <span className="font-bold text-sm md:text-base text-foreground dark:text-zinc-50">Active Insights</span>
                </div>
                <span className="text-xs text-muted-foreground text-center lg:text-left">Track daily sales</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Dashboard Preview */}
          <div
            className="lg:col-span-6 flex items-center justify-center relative animate-fade-in"
            style={{ animationDelay: "1100ms" }}
          >
            <div className="relative w-full max-w-[500px] flex items-center justify-center p-2">
              {/* Decorative Circle Background */}
              <div className="absolute inset-4 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl -z-10 animate-pulse"></div>
              <div className="absolute inset-16 rounded-full border border-dashed border-primary/20 animate-spin-slow motion-safe:animate-float -z-10"></div>

              {/* Dashboard Preview Card */}
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl text-white select-none transition-transform duration-500 hover:scale-[1.01] hover:shadow-primary/5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    <span className="text-[10px] text-zinc-500 font-mono ml-2">control-center.chatorijeep.com</span>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-none text-[9px] font-extrabold uppercase tracking-wide">
                    LIVE PANEL PREVIEW
                  </Badge>
                </div>

                {/* Today's Orders stats grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase font-black block">New</span>
                    <span className="text-lg font-heading font-black text-blue-400 block mt-0.5">12</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase font-black block">Preparing</span>
                    <span className="text-lg font-heading font-black text-amber-500 block mt-0.5">8</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase font-black block">Ready</span>
                    <span className="text-lg font-heading font-black text-green-500 block mt-0.5">5</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase font-black block">Completed</span>
                    <span className="text-lg font-heading font-black text-zinc-400 block mt-0.5">24</span>
                  </div>
                </div>

                {/* Active Orders List Mockup */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800/60 rounded-xl p-3 transition-colors hover:bg-zinc-950">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-zinc-600">#1042</span>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-zinc-200">Paneer Tikka + Fries</h4>
                        <span className="text-[9px] text-zinc-500 block">2 items · Table 4</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold shrink-0">
                      Preparing
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800/60 rounded-xl p-3 transition-colors hover:bg-zinc-950">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-zinc-600">#1041</span>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-zinc-200">Cheese Burger</h4>
                        <span className="text-[9px] text-zinc-500 block">1 item · Takeaway</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-bold shrink-0">
                      Ready
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800/60 rounded-xl p-3 transition-colors hover:bg-zinc-950">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-zinc-600">#1040</span>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-zinc-200">Veg Pizza</h4>
                        <span className="text-[9px] text-zinc-500 block">1 item · Delivery</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold shrink-0">
                      New
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800/60 rounded-xl p-3 transition-colors hover:bg-zinc-950 opacity-60">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-zinc-600">#1039</span>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-zinc-200">Masala Sandwich</h4>
                        <span className="text-[9px] text-zinc-500 block">2 items · Table 1</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 text-[9px] font-bold shrink-0">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
