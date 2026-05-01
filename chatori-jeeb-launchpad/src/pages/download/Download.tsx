import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DownloadLayout } from "@/components/download/DownloadLayout";
import { StoreButtons } from "@/components/download/StoreButtons";
import { PhoneMockup } from "@/components/download/PhoneMockup";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  Bike,
  Store,
  Check,
  X,
  ArrowRight,
  ArrowDown,
  Star,
  Download as DownloadIcon,
  Zap,
  MapPin,
  Wallet,
  Clock,
  ClipboardList,
  BarChart3,
  Users,
  Sparkles,
} from "lucide-react";

type AppKey = "user" | "partner" | "restaurant";

const APPS: Record<AppKey, {
  key: AppKey;
  tag: string;
  title: string;
  heading: string;
  description: string;
  to: string;
  Icon: typeof UtensilsCrossed;
  features: { Icon: typeof Zap; title: string; text: string }[];
  screen: { label: string; chips: string[] };
}> = {
  user: {
    key: "user",
    tag: "User App",
    title: "Order Food",
    heading: "Crave it. Tap it. Devour it.",
    description: "Discover thousands of restaurants, track your order live, and get it delivered in minutes.",
    to: "/app/user",
    Icon: UtensilsCrossed,
    features: [
      { Icon: Zap, title: "Lightning checkout", text: "One-tap reorders and saved addresses." },
      { Icon: MapPin, title: "Live tracking", text: "Follow your rider in real time." },
      { Icon: Sparkles, title: "Smart offers", text: "Personalised deals for chatoris." },
    ],
    screen: { label: "User App", chips: ["Biryani 🍛", "Pizza 🍕", "Chaat 🥟", "Live tracking"] },
  },
  partner: {
    key: "partner",
    tag: "Delivery App",
    title: "Earn Money",
    heading: "Earn on your own schedule.",
    description: "Flexible hours, weekly payouts and clear order flow — built for delivery partners.",
    to: "/app/partner",
    Icon: Bike,
    features: [
      { Icon: Clock, title: "Flexible hours", text: "Go online whenever you want." },
      { Icon: Wallet, title: "Weekly payouts", text: "Reliable earnings every week." },
      { Icon: Sparkles, title: "Bonus incentives", text: "Earn more during peak hours." },
    ],
    screen: { label: "Partner App", chips: ["New order ₹148", "1.2 km away", "Today: ₹1,860", "Weekly: ₹12.4K"] },
  },
  restaurant: {
    key: "restaurant",
    tag: "Restaurant App",
    title: "Grow Business",
    heading: "Run your kitchen, smarter.",
    description: "Manage orders, menus and analytics in one place. Reach millions of customers.",
    to: "/app/restaurant",
    Icon: Store,
    features: [
      { Icon: ClipboardList, title: "Order management", text: "Accept, prep and dispatch fast." },
      { Icon: BarChart3, title: "Live analytics", text: "Track sales and top items." },
      { Icon: Users, title: "Customer reach", text: "Get discovered citywide." },
    ],
    screen: { label: "Restaurant App", chips: ["12 live orders", "₹38,420 today", "Top: Paneer Tikka", "★ 4.7"] },
  },
};

const matrix: { feature: string; user: boolean; partner: boolean; restaurant: boolean }[] = [
  { feature: "Order Food", user: true, partner: false, restaurant: false },
  { feature: "Live Tracking", user: true, partner: true, restaurant: true },
  { feature: "Earn Money", user: false, partner: true, restaurant: true },
  { feature: "Manage Orders", user: false, partner: false, restaurant: true },
  { feature: "Analytics Dashboard", user: false, partner: false, restaurant: true },
  { feature: "Weekly Payouts", user: false, partner: true, restaurant: true },
];

const testimonials = [
  { name: "Aarav S.", role: "Foodie, Mumbai", text: "The app is gorgeous and the offers are unbeatable.", rating: 5 },
  { name: "Ritesh K.", role: "Delivery Partner, Pune", text: "Earnings are clear, payouts are weekly. Best gig in town.", rating: 5 },
  { name: "Spice & Smoke", role: "Restaurant, Bengaluru", text: "Orders 3x in 90 days. The dashboard is genuinely useful.", rating: 5 },
];

// === Phone screen content (animated mock UI) ===
const ScreenUser = () => (
  <div className="absolute inset-0 p-4 flex flex-col gap-2 text-foreground">
    <div className="flex items-center justify-between text-[10px] font-semibold opacity-70">
      <span>9:41</span><span>●●●● 5G</span>
    </div>
    <div className="rounded-xl bg-foreground/5 px-3 py-2 text-xs font-medium">Search "Biryani near me"</div>
    <div className="grid grid-cols-2 gap-2 mt-1">
      {["🍛", "🍕", "🍔", "🥟"].map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.5 }}
          className="aspect-square rounded-xl bg-card shadow-soft flex items-center justify-center text-2xl"
        >
          {e}
        </motion.div>
      ))}
    </div>
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="mt-auto rounded-xl bg-gradient-primary text-primary-foreground p-3 text-xs font-bold shadow-glow"
    >
      Arriving in 22 min · Track live
    </motion.div>
  </div>
);

const ScreenPartner = () => (
  <div className="absolute inset-0 p-4 flex flex-col gap-2 text-foreground">
    <div className="flex items-center justify-between text-[10px] font-semibold opacity-70">
      <span>Online</span><span className="text-primary-deep">● Active</span>
    </div>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
      className="rounded-xl bg-card shadow-soft p-3"
    >
      <div className="text-[10px] uppercase opacity-60 font-bold">New order</div>
      <div className="font-extrabold text-lg">₹148</div>
      <div className="text-xs text-muted-foreground">1.2 km · 8 min away</div>
    </motion.div>
    <div className="grid grid-cols-2 gap-2 mt-1">
      <div className="rounded-xl bg-foreground/5 p-2"><div className="text-[10px] opacity-60">Today</div><div className="font-bold">₹1,860</div></div>
      <div className="rounded-xl bg-foreground/5 p-2"><div className="text-[10px] opacity-60">Week</div><div className="font-bold">₹12.4K</div></div>
    </div>
    <motion.div
      initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
      className="mt-auto rounded-xl bg-gradient-primary text-primary-foreground p-3 text-xs font-bold shadow-glow text-center"
    >
      Accept order
    </motion.div>
  </div>
);

const ScreenRestaurant = () => (
  <div className="absolute inset-0 p-4 flex flex-col gap-2 text-foreground">
    <div className="flex items-center justify-between text-[10px] font-semibold opacity-70">
      <span>Dashboard</span><span>★ 4.7</span>
    </div>
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="rounded-xl bg-gradient-primary text-primary-foreground p-3 shadow-glow"
    >
      <div className="text-[10px] uppercase opacity-90 font-bold">Today's revenue</div>
      <div className="text-2xl font-extrabold">₹38,420</div>
    </motion.div>
    <div className="rounded-xl bg-card shadow-soft p-2 text-xs">
      <div className="flex items-end gap-1 h-12">
        {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.05 * i, duration: 0.5 }}
            className="flex-1 bg-gradient-primary rounded-sm"
          />
        ))}
      </div>
    </div>
    <div className="rounded-xl bg-foreground/5 p-2 text-xs"><span className="font-bold">12</span> live orders</div>
  </div>
);

const ScreenFor = ({ k }: { k: AppKey }) => {
  if (k === "user") return <ScreenUser />;
  if (k === "partner") return <ScreenPartner />;
  return <ScreenRestaurant />;
};

// === Hero rotating word ===
const ROTATE = ["Order.", "Earn.", "Grow."];
const RotatingWord = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ROTATE.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block align-baseline min-w-[5ch]">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATE[i]}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block bg-gradient-primary bg-clip-text text-transparent"
        >
          {ROTATE[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

// === Floating phone trio (hero) ===
const FloatingTrio = () => {
  const items: { k: AppKey; rot: number; offset: string; delay: number; scale: number; z: number }[] = [
    { k: "partner", rot: -10, offset: "-translate-x-24 md:-translate-x-32 translate-y-6", delay: 0.1, scale: 0.78, z: 1 },
    { k: "user", rot: 0, offset: "", delay: 0, scale: 1, z: 3 },
    { k: "restaurant", rot: 10, offset: "translate-x-24 md:translate-x-32 translate-y-6", delay: 0.2, scale: 0.78, z: 1 },
  ];
  return (
    <div className="relative h-[440px] md:h-[520px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" aria-hidden />
      {items.map((it) => (
        <motion.div
          key={it.k}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: it.delay + 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute ${it.offset}`}
          style={{ zIndex: it.z }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5 + it.delay * 2, repeat: Infinity, ease: "easeInOut", delay: it.delay }}
            style={{ rotate: it.rot, scale: it.scale }}
          >
            <PhoneMockup label={`${APPS[it.k].tag} preview`}>
              <ScreenFor k={it.k} />
            </PhoneMockup>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

const Download = () => {
  const [tab, setTab] = useState<AppKey>("user");
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const activeApp = APPS[tab];
  const ActiveAppIcon = activeApp.Icon;

  const scrollToSelector = () => selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <DownloadLayout
      title="One Platform. Three Powerful Experiences."
      eyebrow="Download"
      description="Order food, earn on the road, or grow your restaurant — all from one beautifully crafted ecosystem."
      path="/download"
      hero={
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
              <RotatingWord />
              <span className="block text-foreground/80 text-2xl md:text-3xl mt-2 font-semibold">
                One app for every chatori moment.
              </span>
            </div>
            <p className="mt-5 text-muted-foreground max-w-md">
              Designed in India, built for Bharat — Chatori Jeeb's three apps work seamlessly together.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button size="xl" variant="hero" onClick={scrollToSelector} className="group">
                Choose Your App
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
              <button
                onClick={scrollToSelector}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-deep hover:gap-3 transition-all"
              >
                <ArrowDown className="h-4 w-4 animate-bounce" />
                Scroll to explore
              </button>
            </div>
          </div>
          <FloatingTrio />
        </div>
      }
    >
      {/* Trust strip */}
      <section aria-label="Social proof" className="-mt-8 mb-16">
        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-soft">
          {[
            { k: "★ 4.8", v: "App Store rating" },
            { k: "5M+", v: "Downloads" },
            { k: "50+", v: "Cities live" },
            { k: "10K+", v: "Active partners" },
          ].map((s, i) => (
            <motion.div
              key={s.v}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="text-2xl md:text-3xl font-extrabold text-foreground">{s.k}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.v}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Interactive Selector === */}
      <section ref={selectorRef} aria-labelledby="selector" className="scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Pick your experience</span>
          <h2 id="selector" className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">Three apps, one ecosystem</h2>
          <p className="mt-3 text-muted-foreground">Switch between apps to see exactly what each one does best.</p>
        </div>

        {/* Sticky tabs */}
        <div
          ref={tabsRef}
          className="sticky top-20 z-30 mt-8 flex justify-center"
        >
          <div className="relative inline-flex rounded-full border border-border bg-background/80 backdrop-blur-xl p-1.5 shadow-soft">
            {(Object.keys(APPS) as AppKey[]).map((k) => {
              const a = APPS[k];
              const active = tab === k;
              return (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  aria-pressed={active}
                  className="relative px-4 md:px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 z-10 transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="dl-tab-active"
                      className="absolute inset-0 rounded-full bg-gradient-primary shadow-glow"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-2 ${active ? "text-primary-foreground" : "text-foreground/70"}`}>
                    {(() => { const I = a.Icon; return <I className="h-4 w-4" />; })()}
                    <span className="hidden sm:inline">{a.tag}</span>
                    <span className="sm:hidden">{a.title.split(" ")[0]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Showcase */}
        <div className="mt-12 grid lg:grid-cols-2 gap-12 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + "-text"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary-deep text-xs font-bold uppercase tracking-widest">
                <ActiveAppIcon className="h-3.5 w-3.5" /> {activeApp.tag}
              </span>
              <h3 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                {activeApp.heading}
              </h3>
              <p className="mt-4 text-muted-foreground text-lg max-w-md">{activeApp.description}</p>

              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                {activeApp.features.map((f, i) => {
                  const FeatureIcon = f.Icon;

                  return (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                      className="rounded-2xl border border-border bg-card p-4 hover:border-primary/60 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
                        <FeatureIcon className="h-4 w-4" />
                      </span>
                      <div className="mt-3 text-sm font-bold">{f.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{f.text}</div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <StoreButtons />
                <Button asChild variant="ghost" className="group">
                  <Link to={activeApp.to}>
                    Learn more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab + "-phone"}
                initial={{ opacity: 0, y: 30, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -20, rotate: 4 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-gradient-primary opacity-25 blur-3xl rounded-full" aria-hidden />
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <PhoneMockup label={`${APPS[tab].tag} preview`}>
                    <ScreenFor k={tab} />
                  </PhoneMockup>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* === Comparison === */}
      <section aria-labelledby="compare" className="mt-28">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Compare</span>
          <h2 id="compare" className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">What each app does best</h2>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="grid grid-cols-4 bg-gradient-warm">
            <div className="p-4 md:p-5 font-bold text-sm md:text-base">Feature</div>
            {(Object.keys(APPS) as AppKey[]).map((k) => {
              const a = APPS[k];
              const active = tab === k;
              return (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`p-4 md:p-5 font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-colors ${
                    active ? "bg-gradient-primary text-primary-foreground" : "hover:bg-primary/5"
                  }`}
                >
                  {(() => { const I = a.Icon; return <I className="h-4 w-4" />; })()}
                  <span className="hidden sm:inline">{a.tag}</span>
                  <span className="sm:hidden">{a.title.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
          {matrix.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`grid grid-cols-4 border-t border-border ${i % 2 ? "bg-background/40" : ""}`}
            >
              <div className="p-4 md:p-5 font-medium text-sm md:text-base">{row.feature}</div>
              {(["user", "partner", "restaurant"] as AppKey[]).map((k) => {
                const on = row[k];
                const active = tab === k;
                return (
                  <div key={k} className={`p-4 md:p-5 flex justify-center ${active ? "bg-primary/5" : ""}`}>
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 + 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                        on ? "bg-primary/15 text-primary-deep" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {on ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </motion.span>
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Testimonials === */}
      <section aria-labelledby="loved" className="mt-28">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Loved across India</span>
          <h2 id="loved" className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">Real chatoris. Real reviews.</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex gap-1 text-primary-deep" aria-label={`${t.rating} star rating`}>
                {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-3 text-foreground/90">"{t.text}"</p>
              <div className="mt-5">
                <div className="font-bold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* === Final CTA === */}
      <section className="mt-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-primary text-primary-foreground p-10 md:p-16 text-center shadow-elegant"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-20 w-96 h-96 bg-primary-foreground/30 rounded-full blur-3xl"
            aria-hidden
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-32 -right-20 w-96 h-96 bg-primary-foreground/20 rounded-full blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <DownloadIcon className="h-10 w-10 mx-auto opacity-90" />
            <h2 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">Download the future of food delivery</h2>
            <p className="mt-3 opacity-90 max-w-xl mx-auto">Three apps. One ecosystem. Built for chatoris everywhere.</p>
            <div className="mt-8"><StoreButtons align="center" /></div>
          </div>
        </motion.div>
      </section>
    </DownloadLayout>
  );
};

export default Download;
