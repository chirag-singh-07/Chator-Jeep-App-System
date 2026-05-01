import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import mock1 from "@/assets/app-mockup-1.png";
import mock2 from "@/assets/app-mockup-2.png";
import { GradientText } from "@/components/GradientText";

const easeApple = [0.16, 1, 0.3, 1] as const;

export const AppShowcase = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [-12, 12]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.05, 0.95]);

  return (
    <section id="app" ref={ref} className="relative py-24 md:py-32 overflow-hidden bg-gradient-warm">
      {/* Animated background blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary-glow/30 blur-3xl pointer-events-none"
      />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: easeApple }}
          >
            <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Our Apps</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
              Beautiful by design.<br />
              <GradientText>Built for speed.</GradientText>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              From discovery to doorstep, every screen is crafted for clarity and joy. Order, track, and devour — all in fewer taps than your last group chat.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
              {[
                { k: "30s", v: "Avg. checkout" },
                { k: "<25min", v: "Avg. delivery" },
                { k: "Live", v: "Order tracking" },
                { k: "24/7", v: "Customer care" },
              ].map((s, i) => (
                <motion.div
                  key={s.v}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.9, ease: easeApple }}
                  whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.4, ease: easeApple } }}
                  className="rounded-2xl bg-card border border-border p-4 shadow-soft cursor-default"
                >
                  <div className="text-2xl font-extrabold text-primary-deep">{s.k}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ scale }}
            className="relative h-[700px] md:h-[800px] flex justify-center items-center"
          >
            {/* Glowing ring behind phones */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-[420px] h-[420px] md:w-[520px] md:h-[520px] rounded-full border-2 border-dashed border-primary/40"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full border border-primary/30"
            />

            {/* Floating sparkle dots */}
            {[
              { top: "10%", left: "15%", delay: 0 },
              { top: "20%", right: "10%", delay: 0.5 },
              { bottom: "15%", left: "5%", delay: 1 },
              { bottom: "25%", right: "8%", delay: 1.5 },
            ].map((dot, i) => (
              <motion.div
                key={i}
                animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: dot.delay, ease: "easeInOut" }}
                style={dot as React.CSSProperties}
                className="absolute w-3 h-3 rounded-full bg-primary shadow-glow"
              />
            ))}

            <motion.img
              src={mock1}
              alt="Chatori Jeeb ordering app"
              loading="lazy"
              style={{ y: y1, rotate: rotate1 }}
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              className="absolute w-80 md:w-[26rem] lg:w-[30rem] drop-shadow-2xl -translate-x-16 md:-translate-x-24 z-10"
            />
            <motion.img
              src={mock2}
              alt="Chatori Jeeb tracking app"
              loading="lazy"
              style={{ y: y2, rotate: rotate2 }}
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              className="absolute w-72 md:w-96 lg:w-[28rem] drop-shadow-2xl translate-x-24 md:translate-x-36 translate-y-24 z-20"
            />

            {/* Floating notification card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              animate={{ y: [0, -8, 0] }}
              transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.6, delay: 0.8 } }}
              className="absolute top-[12%] left-0 md:left-4 bg-card border border-border rounded-2xl p-3 shadow-card flex items-center gap-3 z-30 hidden sm:flex"
            >
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-lg">🍕</div>
              <div>
                <div className="text-xs font-bold">Order placed!</div>
                <div className="text-[10px] text-muted-foreground">Arriving in 22 min</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              animate={{ y: [0, 10, 0] }}
              transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.6, delay: 1 } }}
              className="absolute bottom-[10%] right-0 md:right-4 bg-card border border-border rounded-2xl p-3 shadow-card z-30 hidden sm:block"
            >
              <div className="text-xs text-muted-foreground">Rider nearby</div>
              <div className="text-sm font-bold text-primary-deep mt-0.5">⚡ 2 min away</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
