import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Apple, Smartphone, Star } from "lucide-react";
import mock from "@/assets/app-mockup-1.png";

export const AppDownload = () => {
  return (
    <section id="download" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-cta animate-gradient-shift opacity-95" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-background/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-glow/40 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-primary-foreground"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/10 backdrop-blur border border-foreground/10 text-xs font-bold uppercase tracking-wider">
              <Star className="h-3 w-3 fill-current" /> Free download
            </div>
            <h2 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight text-balance">
              Get Chatori Jeeb on your phone
            </h2>
            <p className="mt-5 text-lg text-primary-foreground/80 max-w-md">
              Order in seconds, track live, earn flexibly, or grow your restaurant — your favorite food universe in one app.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <motion.div whileHover={{ y: -3, scale: 1.03 }}>
                <Link
                  to="/app/user"
                  aria-label="Download user app on the App Store"
                  className="group flex items-center gap-3 h-14 px-6 rounded-2xl bg-foreground text-background shadow-soft"
                >
                  <Apple className="h-7 w-7" />
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase opacity-70">Download on</div>
                    <div className="text-base font-bold">App Store</div>
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -3, scale: 1.03 }}>
                <Link
                  to="/app/user"
                  aria-label="Get the user app on Google Play"
                  className="group flex items-center gap-3 h-14 px-6 rounded-2xl bg-foreground text-background shadow-soft"
                >
                  <Smartphone className="h-7 w-7" />
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase opacity-70">Get it on</div>
                    <div className="text-base font-bold">Google Play</div>
                  </div>
                </Link>
              </motion.div>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-9 w-9 rounded-full border-2 border-primary bg-foreground/90 flex items-center justify-center text-background text-xs font-bold">
                    {String.fromCharCode(64+i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-bold flex items-center gap-1">⭐ 4.9 · 10K+ reviews</div>
                <div className="text-primary-foreground/70 text-xs">Top 10 in Food & Drink</div>
              </div>
            </div>
          </motion.div>

          {/* Phone with floating glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 bg-background/30 rounded-full blur-3xl" />
            <motion.img
              src={mock}
              alt="Chatori Jeeb mobile app"
              loading="lazy"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-72 md:w-96 drop-shadow-2xl"
            />
            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 -left-4 md:-left-8 bg-card text-card-foreground rounded-2xl p-3 shadow-glow flex items-center gap-2"
            >
              <span className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center">🍕</span>
              <div className="text-xs">
                <div className="font-bold">Order placed!</div>
                <div className="text-muted-foreground">Arriving in 22 min</div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-16 -right-2 md:-right-6 bg-card text-card-foreground rounded-2xl p-3 shadow-glow flex items-center gap-2"
            >
              <span className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center">⭐</span>
              <div className="text-xs">
                <div className="font-bold">+₹120 saved</div>
                <div className="text-muted-foreground">Welcome offer</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
