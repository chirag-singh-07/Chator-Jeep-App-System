import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    if (inView) {
      const c = animate(count, to, { duration: 2.2, ease: "easeOut" });
      return c.stop;
    }
  }, [inView, to, count]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

const stats = [
  { value: 10000, suffix: "+", label: "Orders Delivered" },
  { value: 500, suffix: "+", label: "Restaurants Onboard" },
  { value: 1000, suffix: "+", label: "Delivery Partners" },
  { value: 50, suffix: "+", label: "Cities Covered" },
];

export const Stats = () => {
  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }} />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-extrabold text-primary-foreground tracking-tight">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-primary-foreground/80 font-semibold">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
