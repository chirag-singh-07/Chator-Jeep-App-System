import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingBag01Icon, CookingPotIcon, Book02Icon, AnalyticsUpIcon, Settings01Icon, BellIcon } from "@hugeicons/core-free-icons";
import { ScrollReveal } from "./scroll-reveal";
import { Badge } from "@/components/ui/badge";

const valueStripItems = [
  { icon: ShoppingBag01Icon, label: "Live Orders", desc: "Incoming tickets in real time" },
  { icon: CookingPotIcon, label: "Kitchen Sync", desc: "Preparation workflow track" },
  { icon: Book02Icon, label: "Menu Control", desc: "Instant pricing & availability" },
  { icon: AnalyticsUpIcon, label: "Insights", desc: "Daily revenue & performance" },
];

const features = [
  {
    icon: ShoppingBag01Icon,
    title: "Order Management",
    subtitle: "Manage Every Order",
    description: "See incoming orders in real time, update order statuses, and keep your entire team informed of order progress.",
    extra: (
      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t">
        {["New", "Accepted", "Preparing", "Ready", "Completed", "Cancelled"].map((s) => (
          <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
            {s}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: CookingPotIcon,
    title: "Kitchen Management",
    subtitle: "Keep Your Kitchen Moving",
    description: "Give your kitchen team a clear, direct view of what needs to be prepared, what is cooking, and what is ready to package.",
    extra: (
      <div className="flex items-center gap-1 mt-4 pt-3 border-t text-[10px] text-muted-foreground font-mono">
        <span>New</span>
        <span className="text-primary font-bold">→</span>
        <span>Prep</span>
        <span className="text-primary font-bold">→</span>
        <span>Ready</span>
        <span className="text-primary font-bold">→</span>
        <span>Done</span>
      </div>
    ),
  },
  {
    icon: Book02Icon,
    title: "Menu Management",
    subtitle: "Your Menu, Your Control",
    description: "Easily manage dishes, prices, categories, and item availability instantly from your management control center.",
    extra: (
      <div className="space-y-1.5 mt-4 pt-3 border-t text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Paneer Tikka</span>
          <span className="text-green-600 font-bold">● Available</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Cheese Burger</span>
          <span className="text-green-600 font-bold">● Available</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Masala Fries</span>
          <span className="text-zinc-400">○ Unavailable</span>
        </div>
      </div>
    ),
  },
  {
    icon: Settings01Icon,
    title: "Restaurant Info",
    subtitle: "Manage Your Restaurant",
    description: "Keep your kitchen configuration, operating hours, contact details, settings, and operational details organized.",
  },
  {
    icon: BellIcon,
    title: "Notifications",
    subtitle: "Never Miss an Order",
    description: "Stay fully informed with timely visual and sound notifications when new orders arrive or status changes occur.",
  },
  {
    icon: AnalyticsUpIcon,
    title: "Performance Insights",
    subtitle: "Know How You're Performing",
    description: "Track your restaurant's activity, understand your orders and sales, and audit your daily performance.",
  },
];

export function FoodCategories() {
  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 space-y-16">
        
        {/* Value Strip */}
        <ScrollReveal animation="zoom-in">
          <div className="bg-background border rounded-2xl p-5 md:p-8 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {valueStripItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3.5 group cursor-pointer">
                <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0 transition-transform group-hover:scale-110">
                  <HugeiconsIcon icon={item.icon} size={22} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <h4 className="font-heading text-sm font-black leading-tight text-foreground dark:text-zinc-50">
                    {item.label}
                  </h4>
                  <span className="text-xs text-muted-foreground leading-tight block mt-0.5">
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Features Section */}
        <div className="space-y-12">
          <ScrollReveal>
            <div className="text-center max-w-[620px] mx-auto space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Everything You Need</span>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground dark:text-zinc-50">
                Run Your Restaurant in Control
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                From the moment an order arrives to the moment it is completed, Chatori Jeep Kitchen helps your team stay organized and in control.
              </p>
            </div>
          </ScrollReveal>

          {/* Features Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, idx) => (
              <ScrollReveal key={idx} delay={idx * 75} animation="fade-in-up">
                <div className="group border shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 rounded-2xl p-6 bg-card flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="p-3.5 bg-primary/10 text-primary rounded-xl shrink-0 w-fit group-hover:scale-105 transition-transform">
                      <HugeiconsIcon icon={feat.icon} size={22} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase text-primary tracking-wider">{feat.title}</span>
                      <h3 className="font-heading text-lg font-bold text-foreground dark:text-zinc-50 leading-tight">
                        {feat.subtitle}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                  {feat.extra && feat.extra}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
