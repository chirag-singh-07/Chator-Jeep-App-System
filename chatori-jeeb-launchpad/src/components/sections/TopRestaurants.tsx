import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Clock } from "lucide-react";
import r1 from "@/assets/rest-1.jpg";
import r2 from "@/assets/rest-2.jpg";
import r3 from "@/assets/rest-3.jpg";
import r4 from "@/assets/rest-4.jpg";
import r5 from "@/assets/rest-5.jpg";

gsap.registerPlugin(ScrollTrigger);

const restaurants = [
  { name: "The Brick House", cuisine: "Continental · Indian", img: r1, rating: 4.8, time: "25 min", price: "₹₹" },
  { name: "Pizza Sultan", cuisine: "Italian · Pizza", img: r2, rating: 4.7, time: "20 min", price: "₹₹" },
  { name: "Royal Kitchen", cuisine: "Fine Dining · Mughlai", img: r3, rating: 4.9, time: "35 min", price: "₹₹₹" },
  { name: "Burger Town", cuisine: "American · Fast Food", img: r4, rating: 4.6, time: "18 min", price: "₹" },
  { name: "Sweet Crumb", cuisine: "Bakery · Desserts", img: r5, rating: 4.8, time: "30 min", price: "₹₹" },
];

export const TopRestaurants = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !trackRef.current) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const track = trackRef.current!;
      const wrapper = wrapperRef.current!;
      const distance = track.scrollWidth - window.innerWidth + 100;

      const tween = gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => { tween.kill(); };
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="restaurants" ref={wrapperRef} className="py-24 md:py-32 bg-gradient-warm overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Hand-picked</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Top restaurants near you</h2>
          </div>
          <p className="text-muted-foreground max-w-md">Scroll through our curated favorites — fan-loved, kitchen-tested, delivery-ready.</p>
        </motion.div>
      </div>

      <div ref={trackRef} className="flex gap-6 px-6 lg:px-12 lg:will-change-transform">
        {restaurants.map((r) => (
          <div key={r.name} className="group flex-shrink-0 w-[300px] md:w-[380px] rounded-3xl overflow-hidden bg-card border border-border shadow-card hover:shadow-glow transition-all">
            <div className="relative h-56 overflow-hidden">
              <img src={r.img} alt={r.name} loading="lazy" width={768} height={576} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/90 backdrop-blur text-xs font-bold flex items-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" /> {r.rating}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-foreground/40 transition-opacity">
                <Link to="/app/user" className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold shadow-glow">Order Now</Link>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg">{r.name}</h3>
                <span className="text-sm text-muted-foreground">{r.price}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{r.cuisine}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {r.time} delivery
              </div>
            </div>
          </div>
        ))}
        {/* Spacer for end */}
        <div className="flex-shrink-0 w-12" />
      </div>
    </section>
  );
};
