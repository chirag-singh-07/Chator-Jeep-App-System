import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";
import burger from "@/assets/burger.png";
import pizza from "@/assets/pizza.png";
import samosa from "@/assets/samosa.png";
import noodles from "@/assets/noodles.png";
import { GradientText } from "@/components/GradientText";
import { RevealText, appleEase } from "@/components/RevealText";
import { LazyImage } from "@/components/LazyImage";

const floatingFoods = [
  { img: burger, className: "top-[10%] left-[5%] w-24 md:w-32", delay: 0, duration: 7 },
  { img: pizza, className: "top-[20%] right-[8%] w-28 md:w-36", delay: 0.5, duration: 8 },
  { img: samosa, className: "bottom-[15%] left-[10%] w-20 md:w-28", delay: 1, duration: 6 },
  { img: noodles, className: "bottom-[20%] right-[12%] w-24 md:w-32", delay: 1.5, duration: 9 },
];

export const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-32 bg-gradient-warm">
      {/* Decorative radial */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-32 w-96 h-96 rounded-full bg-primary-glow/30 blur-3xl pointer-events-none" />

      {/* Floating food cards */}
      {floatingFoods.map((f, i) => (
        <motion.img
          key={i}
          src={f.img}
          alt=""
          aria-hidden
          className={`absolute ${f.className} drop-shadow-2xl pointer-events-none select-none hidden sm:block`}
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: f.delay },
            scale: { duration: 0.8, delay: f.delay },
            y: { duration: f.duration, repeat: Infinity, ease: "easeInOut", delay: f.delay },
            rotate: { duration: f.duration * 1.5, repeat: Infinity, ease: "easeInOut", delay: f.delay },
          }}
        />
      ))}

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: appleEase }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-sm font-semibold text-primary-deep mb-6"
          >
            <Sparkles className="h-4 w-4" />
            India's most chatori delivery app
          </motion.div>

          <h1 className="relative z-10 text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-[1.08] text-foreground">
            <RevealText text="Craving something" delay={0.15} />{" "}
            <span className="relative inline-block whitespace-nowrap align-bottom" style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
              <span className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: 0.35, ease: appleEase }}
                >
                  <GradientText>delicious?</GradientText>
                </motion.span>
              </span>
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 1.1, ease: appleEase }}
                className="absolute left-0 right-0 bottom-1 md:bottom-2 h-[10px] md:h-[14px] bg-primary/40 rounded-full origin-left -z-0"
              />
            </span>
            <br />
            <RevealText text="Chatori Jeeb delivers!" delay={0.55} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.95, ease: appleEase }}
            className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance"
          >
            Order food, earn by delivering, or grow your restaurant — all in one vibrant platform built for foodies, riders, and partners.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.15, ease: appleEase }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild variant="hero" size="xl" className="group">
              <Link to="/app/user">
                Order Now
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outlineHero" size="xl">
              <Link to="/app/partner">Become a Partner</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.4, ease: appleEase }}
            className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-background bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {String.fromCharCode(64+i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="font-bold text-foreground">⭐ 4.9 / 5</div>
              <div>Loved by 10,000+ foodies</div>
            </div>
          </motion.div>
        </div>

        {/* Hero food image strip */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.4, delay: 1.1, ease: appleEase }}
          className="mt-20 max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-glow ring-1 ring-primary/20"
        >
          <LazyImage
            src={heroFood}
            alt="A vibrant spread of Indian food delivered by Chatori Jeeb"
            width={1920}
            height={1080}
            loading="eager"
            // @ts-expect-error fetchpriority is a valid HTML attribute, not yet typed in React
            fetchpriority="high"
            className="w-full h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
};
