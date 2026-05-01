import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Menu, X } from "lucide-react";

const links = [
  { label: "Categories", href: "#categories", id: "categories" },
  { label: "How", href: "#how", id: "how" },
  { label: "Earn", href: "#earnings", id: "earnings" },
  { label: "Restaurants", href: "#restaurants", id: "restaurants" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-soft" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <a href="#" className="flex items-center gap-2 font-extrabold text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </span>
          <span>Chatori <span className="text-primary-deep">Jeeb</span></span>
        </a>

        <ul className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <li key={l.href}>
                <a href={l.href} className="relative px-3 py-2 inline-flex rounded-full text-foreground/80 hover:text-foreground transition-colors">
                  {isActive && (
                    <motion.span layoutId="navActive" className="absolute inset-0 rounded-full bg-primary/15" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <span className="relative">{l.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/app/user">Order Now</Link>
          </Button>
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
        >
          <ul className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {links.map((l) => (
              <li key={l.href}><a href={l.href} onClick={() => setOpen(false)} className="block py-2 font-medium">{l.label}</a></li>
            ))}
            <Button asChild variant="hero" size="sm" className="mt-2">
              <Link to="/app/user" onClick={() => setOpen(false)}>Order Now</Link>
            </Button>
          </ul>
        </motion.div>
      )}
    </motion.header>
  );
};
