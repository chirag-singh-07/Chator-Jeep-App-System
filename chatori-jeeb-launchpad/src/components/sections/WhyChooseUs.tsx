import { motion } from "framer-motion";
import { Rocket, Utensils, MapPin, Wallet } from "lucide-react";

const reasons = [
  { icon: Rocket, title: "Lightning fast delivery", desc: "Average 25 min from kitchen to your door." },
  { icon: Utensils, title: "Wide food variety", desc: "From street snacks to fine dining — endless choices." },
  { icon: MapPin, title: "Real-time tracking", desc: "Watch your order journey, every step of the way." },
  { icon: Wallet, title: "Best earnings", desc: "Industry-leading payouts for partners & restaurants." },
];

export const WhyChooseUs = () => {
  return (
    <section id="why" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Why Chatori Jeeb</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Built for foodies, riders & restaurants</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="rounded-2xl bg-card border border-border p-6 hover:border-primary/50 hover:shadow-card transition-all"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary-deep mb-4"
              >
                <r.icon className="h-6 w-6" />
              </motion.div>
              <h3 className="font-bold text-lg mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
