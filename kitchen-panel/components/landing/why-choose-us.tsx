import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, ShieldIcon, CookingPotIcon, AnalyticsUpIcon } from "@hugeicons/core-free-icons";
import { ScrollReveal } from "./scroll-reveal";

const benefits = [
  {
    icon: Clock01Icon,
    title: "Save Time",
    description: "Spend less time managing tickets and coordinates manually. Direct automation syncs kitchen teams in seconds.",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: ShieldIcon,
    title: "Reduce Mistakes",
    description: "Keep all order details, table numbers, and adjustments visible and organized in a structured, live queue.",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  {
    icon: CookingPotIcon,
    title: "Improve Kitchen Flow",
    description: "Give your kitchen operators a clean preparation layout. Steer dishes smoothly through preparation, cooking and packaging.",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    icon: AnalyticsUpIcon,
    title: "Make Better Decisions",
    description: "Access reliable daily summaries of sales, orders, and popular items to understand and grow your business.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-muted/20 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Title */}
        <ScrollReveal>
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Owner Benefits</span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground dark:text-zinc-50 mt-2">
              Less Chaos. More Control.
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Streamline operations, reduce ticket processing friction, and keep your kitchen executing at peak efficiency.
            </p>
          </div>
        </ScrollReveal>

        {/* Benefits Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, idx) => (
            <ScrollReveal key={idx} delay={idx * 75} animation="fade-in-up">
              <Card className="group border shadow-xs hover:shadow-md hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300 rounded-2xl flex flex-col items-center text-center p-6 bg-card">
                
                {/* Icon Container */}
                <div className={`p-4 rounded-2xl mb-4 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-current/10 ${benefit.color}`}>
                  <HugeiconsIcon icon={benefit.icon} size={28} strokeWidth={2.5} className="group-hover:rotate-6 transition-transform duration-300" />
                </div>

                <CardHeader className="p-0 mb-2">
                  <CardTitle className="font-heading text-lg font-bold group-hover:text-primary transition-colors">
                    {benefit.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
