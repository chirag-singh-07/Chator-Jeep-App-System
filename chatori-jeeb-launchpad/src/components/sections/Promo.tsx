import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Play } from "lucide-react";
import promoBg from "@/assets/promo-bg.jpg";
import { GradientText } from "@/components/GradientText";

export const Promo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.05]);

  return (
    <section ref={ref} className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={promoBg} alt="Chatori Jeeb in action" loading="lazy" width={1536} height={864} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/60 to-foreground/80" />
      </motion.div>

      <div className="relative h-full container mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center text-background">
        <motion.button
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.1 }}
          className="relative mb-8 h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-glow"
        >
          <Play className="h-8 w-8 text-primary-foreground fill-current ml-1" />
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" />
        </motion.button>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl text-balance"
        >
          देखो कैसे <GradientText>Chatori Jeeb</GradientText> बदल रहा है food delivery
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 max-w-xl text-background/80 text-lg"
        >
          From the first tap to the last bite — see the magic unfold across 50+ cities.
        </motion.p>
      </div>
    </section>
  );
};
