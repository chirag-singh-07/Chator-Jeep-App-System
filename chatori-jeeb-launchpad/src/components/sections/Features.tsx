import { motion } from "framer-motion";
import { ChefHat, Bike, Store } from "lucide-react";

const features = [
  {
    icon: ChefHat,
    title: "User App",
    desc: "Browse thousands of restaurants, order in seconds, and track your food live — every craving, sorted.",
    points: ["Live order tracking", "Personalized picks", "Lightning checkout"],
  },
  {
    icon: Bike,
    title: "Delivery Partner",
    desc: "Earn flexibly on your own schedule. Daily payouts, smart routing, and fair incentives keep you moving.",
    points: ["Flexible hours", "Daily payouts", "Smart navigation"],
  },
  {
    icon: Store,
    title: "Restaurant",
    desc: "A complete dashboard to manage orders, menu, and growth — turn every kitchen into a brand.",
    points: ["Order management", "Menu insights", "Growth analytics"],
  },
];

export const Features = () => {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">One Platform</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
            Three powerful experiences
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Whether you eat, ride, or run a restaurant — Chatori Jeeb has an app built for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              className="group relative rounded-3xl bg-card border border-border p-8 shadow-card hover:shadow-glow transition-all duration-500 overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-500 blur-2xl" />

              <div className="relative">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  <f.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground mb-6">{f.desc}</p>
                <ul className="space-y-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
