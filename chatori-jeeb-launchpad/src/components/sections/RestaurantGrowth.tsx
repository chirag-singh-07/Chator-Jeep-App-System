import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Sparkles, Check } from "lucide-react";
import dashboard from "@/assets/dashboard.png";
import { GradientText } from "@/components/GradientText";
import { LazyImage } from "@/components/LazyImage";

const benefits = [
  { icon: TrendingUp, title: "More orders, every day", desc: "Reach hungry customers across your city with smart promotions." },
  { icon: BarChart3, title: "Powerful analytics", desc: "Live order feed, top items, customer insights — all on one screen." },
  { icon: Sparkles, title: "Easy onboarding", desc: "List your menu in minutes. We'll handle photos, branding, and rollout." },
];

// Animated SVG mini-chart
function MiniChart() {
  return (
    <svg viewBox="0 0 220 80" className="w-full h-20">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0 60 L30 50 L60 55 L90 35 L120 40 L150 22 L180 28 L220 10 L220 80 L0 80 Z"
        fill="url(#cg)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
      <motion.path
        d="M0 60 L30 50 L60 55 L90 35 L120 40 L150 22 L180 28 L220 10"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
    </svg>
  );
}

export const RestaurantGrowth = () => {
  return (
    <section id="grow" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute -inset-8 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden shadow-glow border border-border bg-card">
              <LazyImage src={dashboard} alt="Restaurant analytics dashboard" width={1280} height={960} className="w-full h-auto" />
            </div>

            {/* Floating mini cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 md:top-6 md:-right-8 bg-card border border-border rounded-2xl p-4 shadow-card w-48 hidden sm:block"
            >
              <div className="text-xs text-muted-foreground">Revenue this week</div>
              <div className="text-2xl font-extrabold text-primary-deep mt-1">+38%</div>
              <MiniChart />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 md:bottom-8 md:-left-10 bg-card border border-border rounded-2xl p-4 shadow-card flex items-center gap-3 hidden sm:flex"
            >
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary-deep" />
              </div>
              <div>
                <div className="text-sm font-bold">128 orders</div>
                <div className="text-xs text-muted-foreground">Today so far</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">For Restaurants</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
              Turn your kitchen into a <GradientText>growth engine</GradientText>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">Join 500+ restaurants already growing 2x faster with Chatori Jeeb's tools.</p>

            <div className="mt-8 space-y-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-2xl hover:bg-secondary/60 transition-colors"
                >
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/15 text-primary-deep flex items-center justify-center">
                    <b.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="mt-8 px-8 h-12 rounded-full bg-gradient-primary text-primary-foreground font-bold shadow-glow hover:-translate-y-0.5 transition-transform">
              List your restaurant →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
