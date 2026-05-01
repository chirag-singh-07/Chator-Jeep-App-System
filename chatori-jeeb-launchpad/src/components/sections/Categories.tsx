import { motion } from "framer-motion";
import pizza from "@/assets/cat-pizza.jpg";
import burger from "@/assets/cat-burger.jpg";
import biryani from "@/assets/cat-biryani.jpg";
import street from "@/assets/cat-street.jpg";
import dessert from "@/assets/cat-dessert.jpg";
import healthy from "@/assets/cat-healthy.jpg";

const categories = [
  { name: "Pizza", img: pizza, count: "120+ places" },
  { name: "Burgers", img: burger, count: "85+ places" },
  { name: "Biryani", img: biryani, count: "200+ places" },
  { name: "Street Food", img: street, count: "300+ places" },
  { name: "Desserts", img: dessert, count: "90+ places" },
  { name: "Healthy", img: healthy, count: "60+ places" },
];

export const Categories = () => {
  return (
    <section id="categories" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Explore</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Popular categories</h2>
          <p className="mt-4 text-muted-foreground text-lg">Pick your craving — we'll handle the rest.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((c, i) => (
            <motion.a
              key={c.name}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -8, rotate: -2, scale: 1.04 }}
              className="group relative aspect-square rounded-3xl overflow-hidden shadow-card hover:shadow-glow transition-shadow"
            >
              <img src={c.img} alt={c.name} loading="lazy" width={768} height={768} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-background">
                <div className="font-bold text-lg">{c.name}</div>
                <div className="text-xs opacity-80">{c.count}</div>
              </div>
              <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
