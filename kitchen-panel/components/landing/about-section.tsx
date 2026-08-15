"use client";

import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { CookingPotIcon, StarIcon } from "@hugeicons/core-free-icons";
import { ScrollReveal } from "./scroll-reveal";

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 relative overflow-hidden bg-radial from-primary/5 via-transparent to-transparent">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center overflow-hidden">
          
          {/* Left Column - Kitchen Workflow Visual Board */}
          <ScrollReveal animation="slide-left" className="lg:col-span-6 flex flex-col gap-4 w-full">
            <div className="w-full max-w-[480px] mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Live Kitchen Queue</span>
                <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">KITCHEN LEVEL: active</span>
              </div>

              {/* Workflow Columns represented as rows/cards */}
              <div className="space-y-3">
                {/* Column 1: New orders */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">New Order</span>
                    <span className="text-xs font-mono text-zinc-500">#1051</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-300">2 × Paneer Tikka</span>
                      <span className="text-zinc-400">Regular</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-300">1 × Masala Fries</span>
                      <span className="text-zinc-400">Extra Spicy</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full rounded-lg text-xs font-bold py-3 bg-primary hover:bg-primary/80">
                    Accept Order
                  </Button>
                </div>

                {/* Column 2: Preparing */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 text-left opacity-90">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Preparing</span>
                    <span className="text-xs font-mono text-zinc-500">#1050</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-300">1 × Cheese Burger</span>
                      <span className="text-zinc-400">Lactose-free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-300">2 × Cold Coffee</span>
                      <span className="text-zinc-400">Sweet</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full rounded-lg text-xs font-bold py-3 border-amber-500/30 text-amber-500 hover:bg-amber-500/5">
                    Mark Ready
                  </Button>
                </div>

                {/* Column 3: Ready */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 text-left opacity-70">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-green-500 tracking-wider">Ready to Deliver</span>
                    <span className="text-xs font-mono text-zinc-500">#1049</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-300">3 × Veg Pizza</span>
                      <span className="text-zinc-400">Large</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full rounded-lg text-xs font-bold py-3 border-green-500/30 text-green-500 hover:bg-green-500/5">
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column - Content */}
          <ScrollReveal animation="slide-right" className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">KDS Workflow</span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground dark:text-zinc-50">
              Built for Busy Kitchens
            </h2>
            <div className="space-y-4 max-w-[620px] mx-auto lg:mx-0 text-muted-foreground text-base md:text-lg leading-relaxed">
              <p>
                When orders start coming in fast, your kitchen team needs absolute clarity — not digital complexity. Our KDS screen helps operators cook efficiently without errors.
              </p>
              <p className="text-sm md:text-base opacity-90">
                Incoming tickets appear in real time. Single-tap operations accept, queue, update prep status, and alert dispatchers immediately when cooking is completed.
              </p>
            </div>

            {/* Dialog for Discover Our Story */}
            <div className="pt-4">
              <Dialog>
                <DialogTrigger
                  render={
                    <Button size="lg" className="rounded-full px-8 py-6 font-bold hover:scale-105 active:scale-95 transition-transform duration-200">
                      Explore Kitchen View
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[500px] p-6 rounded-2xl bg-card">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="font-heading text-2xl font-black text-primary">
                      Kitchen Display System 🍳
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1">
                      Designed to reduce prep mistakes and speed up delivery times.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                    <p>
                      <strong>Automatic Routing:</strong> Orders from customers are parsed and routed to the kitchen screen instantly, categorized by items and cooking instructions.
                    </p>
                    <p>
                      <strong>Live Status Sync:</strong> Every status transition (Accepted → Preparing → Ready) updates the customer app, rider coordinates, and admin panel concurrently.
                    </p>
                    <p>
                      <strong>Time Tracking Audit:</strong> The KDS records prep duration metrics to calculate average dispatch times and help optimization workflows.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
