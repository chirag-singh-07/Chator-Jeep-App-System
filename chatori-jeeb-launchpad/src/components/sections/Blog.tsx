import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import b1 from "@/assets/blog-1.jpg";
import b2 from "@/assets/blog-2.jpg";
import b3 from "@/assets/blog-3.jpg";

const posts = [
  { tag: "Food Trends", title: "10 cuisines taking over India in 2026", date: "Apr 28, 2026", img: b1, read: "5 min read" },
  { tag: "Business Tips", title: "How small kitchens scaled to 1,000 orders/month", date: "Apr 20, 2026", img: b2, read: "7 min read" },
  { tag: "Delivery Stories", title: "Inside the life of a top-rated rider", date: "Apr 12, 2026", img: b3, read: "4 min read" },
];

export const Blog = () => {
  return (
    <section id="blog" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">From the blog</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Stories worth a snack</h2>
          </div>
          <a href="#" className="text-sm font-semibold flex items-center gap-1 hover:text-primary-deep transition-colors">View all <ArrowRight className="h-4 w-4" /></a>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <motion.a
              href="#"
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group rounded-3xl overflow-hidden bg-card border border-border shadow-card hover:shadow-glow transition-shadow"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.title} loading="lazy" width={768} height={576} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">{p.tag}</span>
              </div>
              <div className="p-6">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{p.date}</span><span>·</span><span>{p.read}</span>
                </div>
                <h3 className="mt-2 font-bold text-lg leading-snug group-hover:text-primary-deep transition-colors">
                  {p.title}
                </h3>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-deep">
                  Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
