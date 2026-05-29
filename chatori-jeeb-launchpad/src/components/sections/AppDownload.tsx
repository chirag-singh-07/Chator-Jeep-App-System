import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Bike, Store, Star, UtensilsCrossed } from "lucide-react";
import mock from "@/assets/app-mockup-1.png";
import { UserApkButton } from "@/components/download/UserApkButton";
import { RestaurantApkButton } from "@/components/download/RestaurantApkButton";

const apps = [
  {
    label: "User app",
    title: "Order food",
    description: "Browse restaurants, place orders, and track delivery in real time.",
    to: "/app/user",
    Icon: UtensilsCrossed,
  },
  {
    label: "Partner app",
    title: "Earn money",
    description: "Accept orders, deliver on your schedule, and watch your earnings grow.",
    to: "/app/partner",
    Icon: Bike,
  },
  {
    label: "Restaurant app",
    title: "Grow your restaurant",
    description: "Manage orders, menus, and insights from one official app.",
    to: "/app/restaurant",
    Icon: Store,
  },
] as const;

export const AppDownload = () => {
  return (
    <section id="download" className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-cta animate-gradient-shift opacity-95" />
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-background/30 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-primary-foreground"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/10 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              <Star className="h-3 w-3 fill-current" /> Download the apps
            </div>
            <h2 className="mt-5 text-balance text-4xl font-extrabold tracking-tight md:text-6xl">
              Get the right Chatori Jeeb app in one tap
            </h2>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/80">
              Choose your experience below. Order food, deliver orders, or manage your restaurant from the official Chatori Jeeb apps.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {apps.map(({ label, title, description, to, Icon }) => (
                <motion.div key={label} whileHover={{ y: -3, scale: 1.02 }}>
                  <Link
                    to={to}
                    aria-label={`Open the ${label.toLowerCase()} download page`}
                    className="group flex h-full min-h-32 flex-col justify-between rounded-2xl bg-foreground p-5 text-background shadow-soft transition-transform"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="mt-4 text-left">
                      <div className="text-[10px] uppercase opacity-70">{label}</div>
                      <div className="text-lg font-bold">{title}</div>
                      <div className="mt-1 text-sm opacity-80">{description}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-foreground/10 bg-foreground/5 p-4 md:p-5">
              <div className="flex flex-col gap-1">
                <div className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">
                  Direct Android downloads
                </div>
                <p className="text-sm text-primary-foreground/75">
                  Prefer installing from our website? Grab the APKs below for Android devices.
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <UserApkButton compact />
                <RestaurantApkButton compact />
              </div>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-foreground/90 text-xs font-bold text-background"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold">★ 4.9 · 10K+ reviews</div>
                <div className="text-xs text-primary-foreground/70">Top 10 in Food & Drink</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-background/30 blur-3xl" />
            <motion.img
              src={mock}
              alt="Chatori Jeeb mobile app"
              loading="lazy"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-72 drop-shadow-2xl md:w-96"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 -left-4 flex items-center gap-2 rounded-2xl bg-card p-3 text-card-foreground shadow-glow md:-left-8"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary">🍕</span>
              <div className="text-xs">
                <div className="font-bold">Order placed!</div>
                <div className="text-muted-foreground">Arriving in 22 min</div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-16 -right-2 flex items-center gap-2 rounded-2xl bg-card p-3 text-card-foreground shadow-glow md:-right-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary">⭐</span>
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
