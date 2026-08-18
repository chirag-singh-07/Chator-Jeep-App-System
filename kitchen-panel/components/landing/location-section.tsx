import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingBag01Icon, CookingPotIcon, Book02Icon, AnalyticsUpIcon, Settings01Icon, BellIcon } from "@hugeicons/core-free-icons";
import { ScrollReveal } from "./scroll-reveal";
import Image from "next/image";

export function LocationSection() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center overflow-hidden">
          
          {/* Left Column - Contact & Details */}
          <ScrollReveal animation="slide-left" className="lg:col-span-5 space-y-8 text-center lg:text-left">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Unified System</span>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground dark:text-zinc-50">
                One Control Center for Your Restaurant
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                No more jumping between different sheets, spreadsheets, or third-party order apps. Chatori Jeep Kitchen brings your entire business architecture together.
              </p>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3 items-start">
                <div className="p-1 bg-primary/10 text-primary rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary block m-1"></span>
                </div>
                <p>
                  <strong>Centralized Orders:</strong> Process delivery, dine-in, and takeaway tickets from a single layout.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-1 bg-primary/10 text-primary rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary block m-1"></span>
                </div>
                <p>
                  <strong>Hygiene Operations:</strong> Update cooking status to riders and customers automatically.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-1 bg-primary/10 text-primary rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary block m-1"></span>
                </div>
                <p>
                  <strong>Operational Audit:</strong> Sync with your backend databases securely using authenticated admin tokens.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column - Sidebar Navigation Mockup Container */}
          <ScrollReveal animation="slide-right" className="lg:col-span-7 flex justify-center items-center">
            <div className="w-full max-w-[480px] bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
              <div className="absolute inset-4 rounded-full bg-primary/5 blur-2xl -z-10"></div>
              
              <div className="flex gap-5">
                {/* Mock Sidebar */}
                <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 text-zinc-400 space-y-5 select-none text-left">
                  {/* Header */}
                  <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      <Image src="/Restaurant-app-logo.png" alt="logo" width={20} height={20} className="w-full h-auto object-contain" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-white leading-tight">Chatori Jeep</h4>
                      <span className="text-[8px] text-zinc-500 block leading-tight">Ahmedabad Outlet</span>
                    </div>
                  </div>

                  {/* Navigation List */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-lg text-zinc-600">
                      <span>Dashboard</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 text-primary font-bold">
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={ShoppingBag01Icon} size={12} strokeWidth={2.5} />
                        <span>Orders</span>
                      </div>
                      <Badge className="bg-primary text-white text-[8px] font-bold py-0.5 px-1.5 border-none rounded-sm">12</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40">
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={CookingPotIcon} size={12} strokeWidth={2} />
                        <span>Kitchen</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40">
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={Book02Icon} size={12} strokeWidth={2} />
                        <span>Menu Items</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40">
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={Settings01Icon} size={12} strokeWidth={2} />
                        <span>Restaurant</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40">
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={BellIcon} size={12} strokeWidth={2} />
                        <span>Notifications</span>
                      </div>
                      <Badge className="bg-amber-500 text-white text-[8px] font-bold py-0.5 px-1.5 border-none rounded-sm">3</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40">
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={AnalyticsUpIcon} size={12} strokeWidth={2} />
                        <span>Analytics</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini details card simulating dashboard content beside sidebar */}
                <div className="hidden sm:flex flex-col justify-between w-[200px] shrink-0 space-y-3">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-left space-y-1">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Outlet Status</span>
                    <h5 className="text-[11px] font-bold text-green-500">ACTIVE & OPEN</h5>
                    <span className="text-[8px] text-zinc-400 block">Close time: 11:00 PM</span>
                  </div>
                  
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-left space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Cook Load</span>
                      <h5 className="text-sm font-bold text-zinc-200 mt-0.5">85%</h5>
                      <span className="text-[8px] text-zinc-400 block mt-0.5">Kitchen staff active: 6</span>
                    </div>
                    <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary w-[85%] h-full rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
