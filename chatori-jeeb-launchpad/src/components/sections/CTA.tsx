import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Apple, Smartphone } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 md:py-32 px-4 md:px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[2.5rem] overflow-hidden bg-gradient-cta animate-gradient-shift p-10 md:p-20 text-center shadow-glow"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary-foreground text-balance"
            >
              Join the Chatori Jeeb revolution
            </motion.h2>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Whether you're hungry, hustling, or running a kitchen — there's a delicious place for you here.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
                <Link to="/download"><Apple /> Download App</Link>
              </Button>
              <Button asChild size="xl" variant="outlineHero" className="bg-background/90 border-foreground/20 rounded-full">
                <Link to="/app/restaurant"><Smartphone /> Partner With Us</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
