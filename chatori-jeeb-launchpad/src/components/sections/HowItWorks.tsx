import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, ShoppingBag, PartyPopper, MapPin, Bike, Wallet, ClipboardList, BarChart3, Rocket, User, Store } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const tabs = [
  {
    id: "users", label: "For Users", icon: User,
    steps: [
      { icon: Search, title: "Browse & discover", desc: "Find food you love from thousands of nearby restaurants." },
      { icon: ShoppingBag, title: "Order in seconds", desc: "Smart cart, saved addresses, one-tap reorder." },
      { icon: PartyPopper, title: "Eat & enjoy", desc: "Track your order live and devour when it arrives." },
    ],
  },
  {
    id: "partners", label: "For Delivery", icon: Bike,
    steps: [
      { icon: ClipboardList, title: "Sign up in minutes", desc: "Quick onboarding, no fees, get your kit." },
      { icon: MapPin, title: "Accept smart orders", desc: "Auto-routing to maximize earnings per hour." },
      { icon: Wallet, title: "Get paid daily", desc: "Instant payouts, performance bonuses, full transparency." },
    ],
  },
  {
    id: "restaurants", label: "For Restaurants", icon: Store,
    steps: [
      { icon: ClipboardList, title: "List your menu", desc: "Upload your menu, photos, and timings — we handle the rest." },
      { icon: BarChart3, title: "Manage with analytics", desc: "Live orders, sales insights, and customer feedback." },
      { icon: Rocket, title: "Grow your brand", desc: "Promotions, ads, and a loyal foodie community." },
    ],
  },
];

export const HowItWorks = () => {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active)!;
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  // Pinned, scroll-driven step reveal (Apple-style). Desktop only for performance.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 768px)").matches) return;
    if (!sectionRef.current || !stepsRef.current) return;

    const cards = stepsRef.current.querySelectorAll<HTMLElement>("[data-step-card]");
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0.25, y: 40 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top+=80",
          end: "+=1200",
          scrub: 1,
          pin: true,
          pinSpacing: true,
        },
      });
      cards.forEach((card, i) => {
        tl.to(card, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, i * 0.6);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [active]);

  return (
    <section id="how" ref={sectionRef} className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">How it works</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Three simple flows</h2>
          <p className="mt-4 text-muted-foreground text-lg">Whichever side of the kitchen you're on — getting started takes minutes.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-colors ${
                active === t.id ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {active === t.id && (
                <motion.span layoutId="hiwTab" className="absolute inset-0 rounded-full bg-gradient-primary shadow-glow" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className="relative flex items-center gap-2">
                <t.icon className="h-4 w-4" /> {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            ref={stepsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid md:grid-cols-3 gap-6 relative"
          >
            {/* Connector line on desktop */}
            <div className="absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent hidden md:block" />

            {current.steps.map((s, i) => (
              <div
                key={s.title}
                data-step-card
                className="relative rounded-3xl bg-card border border-border p-6 text-center transition-transform duration-500 hover:-translate-y-1"
              >
                <div className="relative mx-auto h-20 w-20 mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 blur-xl" />
                  <div className="relative h-full w-full rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                    <s.icon className="h-9 w-9 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-foreground text-background text-sm font-extrabold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
