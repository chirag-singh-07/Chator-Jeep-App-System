import { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Bike, Calendar, TrendingUp, Zap } from "lucide-react";

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => prefix + Math.round(v).toLocaleString("en-IN"));
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.6, ease: "easeOut" });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{display}</motion.span>;
}

export const EarningsCalculator = () => {
  const [hours, setHours] = useState(6);
  const [days, setDays] = useState(5);

  const stats = useMemo(() => {
    const perDelivery = 55;
    const deliveriesPerHour = 3;
    const dailyDeliveries = hours * deliveriesPerHour;
    const dailyEarn = dailyDeliveries * perDelivery;
    const weekly = dailyEarn * days;
    const monthly = weekly * 4 + 2500; // bonuses
    return { dailyDeliveries, dailyEarn, weekly, monthly };
  }, [hours, days]);

  return (
    <section id="earnings" className="py-24 md:py-32 bg-gradient-warm">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Estimate</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">How much can you earn?</h2>
          <p className="mt-4 text-muted-foreground text-lg">Drag the sliders to see your monthly potential as a Chatori Jeeb partner.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-card border border-border p-8 shadow-card"
          >
            <h3 className="font-bold text-xl mb-8 flex items-center gap-2"><Bike className="text-primary-deep" /> Your schedule</h3>

            <div className="space-y-8">
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <label className="text-sm font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-primary-deep" /> Hours per day</label>
                  <span className="text-2xl font-extrabold text-primary-deep tabular-nums"><AnimatedNumber value={hours} /> hrs</span>
                </div>
                <Slider value={[hours]} min={1} max={12} step={1} onValueChange={(v) => setHours(v[0])} />
                <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>1h</span><span>12h</span></div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <label className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary-deep" /> Days per week</label>
                  <span className="text-2xl font-extrabold text-primary-deep tabular-nums"><AnimatedNumber value={days} /> days</span>
                </div>
                <Slider value={[days]} min={1} max={7} step={1} onValueChange={(v) => setDays(v[0])} />
                <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>1d</span><span>7d</span></div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-secondary p-4">
                <div className="text-xs text-muted-foreground">Daily deliveries</div>
                <div className="text-xl font-extrabold mt-1"><AnimatedNumber value={stats.dailyDeliveries} /></div>
              </div>
              <div className="rounded-2xl bg-secondary p-4">
                <div className="text-xs text-muted-foreground">Daily earnings</div>
                <div className="text-xl font-extrabold mt-1"><AnimatedNumber value={stats.dailyEarn} prefix="₹" /></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-primary p-8 shadow-glow text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-background/20 blur-2xl" />
            <h3 className="font-bold text-xl mb-2 flex items-center gap-2 relative"><TrendingUp /> Your monthly potential</h3>
            <div className="relative mt-8">
              <div className="text-sm opacity-80">Estimated monthly earnings</div>
              <div className="text-6xl md:text-7xl font-extrabold tracking-tight mt-2">
                <AnimatedNumber value={stats.monthly} prefix="₹" />
              </div>
              <div className="mt-2 text-sm opacity-80">Weekly: <AnimatedNumber value={stats.weekly} prefix="₹" /></div>

              <div className="mt-8 space-y-3">
                {[
                  "Daily payouts to your bank",
                  "Performance bonuses included",
                  "Free insurance & support",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm font-medium">
                    <span className="h-5 w-5 rounded-full bg-background/30 flex items-center justify-center text-xs">✓</span>
                    {b}
                  </div>
                ))}
              </div>

              <button className="mt-8 w-full h-12 rounded-full bg-foreground text-background font-bold hover:scale-[1.02] transition-transform">
                Start earning today →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
