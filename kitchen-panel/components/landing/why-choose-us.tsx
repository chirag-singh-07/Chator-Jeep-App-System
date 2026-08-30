import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, ShieldIcon, CookingPotIcon, AnalyticsUpIcon, FastForwardIcon } from "@hugeicons/core-free-icons";
import { ScrollReveal } from "./scroll-reveal";

const benefits = [
  {
    icon: Clock01Icon,
    title: "Save Hours Daily",
    description: "Spend less time managing tickets and coordinates manually. Direct automation syncs kitchen teams in seconds, reducing wait times.",
    color: "from-amber-500/20 to-orange-500/5 text-amber-500 border-amber-500/20",
    iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    className: "md:col-span-8",
    decorativeElement: (
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
        <HugeiconsIcon icon={FastForwardIcon} size={180} />
      </div>
    )
  },
  {
    icon: ShieldIcon,
    title: "Zero Mistakes",
    description: "Keep all order details, table numbers, and adjustments visible in a structured queue.",
    color: "from-red-500/20 to-rose-500/5 text-red-500 border-red-500/20",
    iconBg: "bg-red-500/20 text-red-600 dark:text-red-400",
    className: "md:col-span-4",
  },
  {
    icon: CookingPotIcon,
    title: "Perfect Flow",
    description: "Steer dishes smoothly through preparation, cooking, and packaging without bottlenecks.",
    color: "from-green-500/20 to-emerald-500/5 text-green-500 border-green-500/20",
    iconBg: "bg-green-500/20 text-green-600 dark:text-green-400",
    className: "md:col-span-4",
  },
  {
    icon: AnalyticsUpIcon,
    title: "Data-Driven Growth",
    description: "Access reliable daily summaries of sales, orders, and popular items to understand and grow your business with actionable insights.",
    color: "from-blue-500/20 to-indigo-500/5 text-blue-500 border-blue-500/20",
    iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    className: "md:col-span-8",
    decorativeElement: (
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500">
        <div className="flex items-end gap-2 h-24">
          <div className="w-4 bg-current rounded-t-sm h-1/3 animate-pulse"></div>
          <div className="w-4 bg-current rounded-t-sm h-2/3 animate-pulse" style={{ animationDelay: "150ms" }}></div>
          <div className="w-4 bg-current rounded-t-sm h-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    )
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative bg-zinc-950 py-24 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      <div className="container relative mx-auto px-4 md:px-6 z-10">
        
        {/* Section Title */}
        <ScrollReveal>
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
              Owner Benefits
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-50">
              Less Chaos. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-300">More Control.</span>
            </h2>
            <p className="text-zinc-400 mt-4 text-base md:text-lg">
              Streamline operations, reduce ticket processing friction, and keep your kitchen executing at peak efficiency.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, idx) => (
            <div key={idx} className={`col-span-12 ${benefit.className}`}>
              <ScrollReveal delay={idx * 100} className="h-full">
                <Card className={`group relative h-full overflow-hidden border ${benefit.color.split(' ')[2]} bg-gradient-to-br ${benefit.color.split(' ').slice(0,2).join(' ')} hover:shadow-2xl transition-all duration-500 backdrop-blur-sm bg-opacity-10 dark:bg-zinc-900/50`}>
                  
                  {benefit.decorativeElement}

                  <div className="p-8 relative z-10 flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg ${benefit.iconBg}`}>
                      <HugeiconsIcon icon={benefit.icon} size={28} strokeWidth={2.5} />
                    </div>

                    <h3 className="font-heading text-2xl font-bold text-zinc-50 mb-3 group-hover:text-primary transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-zinc-400 leading-relaxed max-w-sm mt-auto group-hover:text-zinc-300 transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
