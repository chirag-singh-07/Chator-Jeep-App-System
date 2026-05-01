import { Link } from "react-router-dom";
import { UtensilsCrossed, Instagram, Twitter, Facebook, Linkedin } from "lucide-react";

type FooterLink = { label: string; href: string; external?: boolean };

const groups: { title: string; links: FooterLink[] }[] = [
  {
    title: "Apps",
    links: [
      { label: "Download Hub", href: "/download" },
      { label: "User App", href: "/app/user" },
      { label: "Partner App", href: "/app/partner" },
      { label: "Restaurant App", href: "/app/restaurant" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Company Hub", href: "/company" },
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Support Hub", href: "/support" },
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help" },
      { label: "Safety", href: "/safety" },
      { label: "Partner Help", href: "/partner-help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Licenses", href: "/licenses" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid md:grid-cols-6 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
              </span>
              Chatori <span className="text-primary-deep">Jeeb</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              India's vibrant food delivery platform connecting foodies, riders, and restaurants — one delicious order at a time.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" className="h-10 w-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="font-bold mb-4">{g.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {g.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("/") ? (
                      <Link to={l.href} className="hover:text-primary-deep transition-colors">
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className="hover:text-primary-deep transition-colors">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Chatori Jeeb. Crafted with 🧡 in India.</div>
          <div>Made for chatoris, by chatoris.</div>
        </div>
      </div>
    </footer>
  );
};
