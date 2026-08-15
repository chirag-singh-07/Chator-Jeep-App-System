"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldIcon, Settings01Icon, CookingPotIcon } from "@hugeicons/core-free-icons";
import { ScrollReveal } from "./scroll-reveal";

export function OfferBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollReveal animation="zoom-in">
          <div className="relative rounded-3xl overflow-hidden bg-radial from-zinc-900 via-zinc-900 to-zinc-950 text-white py-12 px-6 md:px-12 md:py-16 border border-zinc-800 shadow-2xl">
            
            {/* Background design */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl opacity-40 -z-10"></div>

            <div className="relative z-10 grid gap-8 md:grid-cols-2 max-w-[1100px] mx-auto items-center">
              
              {/* Left Column: Roles */}
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Team Management</span>
                  <h2 className="font-heading text-3xl font-black leading-tight tracking-tight">
                    Built for Your Restaurant Team
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-base">
                    Chatori Jeep Kitchen provides tailored views for different operational roles:
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Role 1 */}
                  <div className="flex gap-3 bg-zinc-950/50 border border-zinc-800/80 p-4 rounded-xl">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0 h-fit">
                      <HugeiconsIcon icon={CookingPotIcon} size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Kitchen Operator (<span className="text-primary font-mono text-xs">KITCHEN</span>)</h4>
                      <p className="text-xs text-zinc-400 mt-1">Focuses entirely on preparing tickets, managing live queue columns, and updating dish availability.</p>
                    </div>
                  </div>

                  {/* Role 2 */}
                  <div className="flex gap-3 bg-zinc-950/50 border border-zinc-800/80 p-4 rounded-xl">
                    <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0 h-fit">
                      <HugeiconsIcon icon={Settings01Icon} size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Restaurant Administrator (<span className="text-primary font-mono text-xs">ADMIN</span>)</h4>
                      <p className="text-xs text-zinc-400 mt-1">Controls menu prices, views daily sales metrics, reviews active orders, and manages wallet withdrawals.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Security */}
              <div className="space-y-6 text-left md:border-l md:border-zinc-800 md:pl-12">
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Secure Operations</span>
                  <h2 className="font-heading text-3xl font-black leading-tight tracking-tight">
                    Your Restaurant Data. Your Control.
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-base">
                    Built with a secure architecture to help keep your operational data private and organized.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3.5 items-start">
                    <div className="p-2 bg-green-500/10 text-green-500 rounded-full shrink-0">
                      <HugeiconsIcon icon={ShieldIcon} size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">Secure Token Authentication</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">Utilizes secure JSON Web Tokens stored in HTTP-only cookies to verify dashboard access sessions.</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start">
                    <div className="p-2 bg-green-500/10 text-green-500 rounded-full shrink-0">
                      <HugeiconsIcon icon={ShieldIcon} size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">Role-Based Endpoint Hashing</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">Enforces route checking middleware on the backend to prevent unauthorized access to operational APIs.</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start">
                    <div className="p-2 bg-green-500/10 text-green-500 rounded-full shrink-0">
                      <HugeiconsIcon icon={ShieldIcon} size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">Data Boundaries</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">Strict database mapping partitions restaurant configurations, order history, and menu items securely.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
