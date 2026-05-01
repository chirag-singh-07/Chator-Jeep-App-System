import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Aarav Sharma", role: "Foodie", quote: "Chatori Jeeb is my late-night savior. The tracking is so smooth, I keep watching it like Netflix!", rating: 5 },
  { name: "Priya Patel", role: "Restaurant Owner", quote: "Onboarding took 10 minutes. My orders doubled in two months — the dashboard is genuinely amazing.", rating: 5 },
  { name: "Rohit Verma", role: "Delivery Partner", quote: "Daily payouts changed my life. The routing is smart and the support team actually picks up.", rating: 5 },
  { name: "Neha Gupta", role: "Foodie", quote: "Cute UI, fast delivery, and prices are honest. Finally a food app that respects my time and wallet.", rating: 5 },
  { name: "Arjun Mehta", role: "Restaurant Owner", quote: "Insights helped me re-design my menu. Revenue up 40%. This isn't just an app — it's a partner.", rating: 5 },
  { name: "Sneha Kapoor", role: "Foodie", quote: "Ordered samosas at midnight. Arrived in 18 minutes, hot. I'm officially a Chatori for life.", rating: 5 },
];

export const Testimonials = () => {
  // Duplicate for seamless loop
  const row = [...testimonials, ...testimonials];

  return (
    <section id="reviews" className="py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Loved by thousands</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Real stories, real cravings</h2>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {row.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 md:w-96 rounded-3xl bg-card border border-border p-6 shadow-soft"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground/90 mb-4 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-primary-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
