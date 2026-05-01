import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { FileText, Shield, Cookie, Scale, ArrowRight } from "lucide-react";

const pages = [
  {
    title: "Terms & Conditions",
    desc: "The rules of using Chatori Jeeb as a customer, rider, or restaurant partner.",
    href: "/terms",
    icon: FileText,
  },
  {
    title: "Privacy Policy",
    desc: "What data we collect, how we use it, and the rights you have over it.",
    href: "/privacy",
    icon: Shield,
  },
  {
    title: "Cookies Policy",
    desc: "How we use cookies and similar technologies on our website and apps.",
    href: "/cookies",
    icon: Cookie,
  },
  {
    title: "Licenses",
    desc: "Open-source libraries, fonts, and assets that power Chatori Jeeb.",
    href: "/licenses",
    icon: Scale,
  },
];

export default function Legal() {
  useEffect(() => {
    document.title = "Legal | Chatori Jeeb";
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta(
      "description",
      "Chatori Jeeb's legal hub — terms, privacy, cookies, and licensing information.",
    );
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + "/legal";
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-warm border-b border-border">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Legal</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Legal information</h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Everything you need to know about using Chatori Jeeb safely, fairly, and transparently.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="grid sm:grid-cols-2 gap-5">
            {pages.map((p) => (
              <Link
                key={p.href}
                to={p.href}
                className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <span className="h-12 w-12 rounded-xl bg-primary/15 text-primary-deep flex items-center justify-center">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <h2 className="text-xl font-bold">{p.title}</h2>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{p.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-deep group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}