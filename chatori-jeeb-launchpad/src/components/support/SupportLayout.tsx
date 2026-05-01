import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ChevronRight } from "lucide-react";

type Props = {
  title: string;
  eyebrow?: string;
  description: string;
  path: string;
  children: ReactNode;
  /** Optional intro element rendered inside the header (e.g. search bar). */
  headerExtra?: ReactNode;
};

export const SupportLayout = ({ title, eyebrow = "Support", description, path, children, headerExtra }: Props) => {
  useEffect(() => {
    document.title = `${title} | Chatori Jeeb`;
    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta("description", description);
    setMeta("og:title", `${title} | Chatori Jeeb`, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + path;
  }, [title, description, path]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-warm border-b border-border">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary-deep transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/support" className="hover:text-primary-deep transition-colors">Support</Link>
            {path !== "/support" && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium">{title}</span>
              </>
            )}
          </nav>
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">{eyebrow}</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{title}</h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl">{description}</p>
          {headerExtra ? <div className="mt-6">{headerExtra}</div> : null}
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">{children}</div>
      </section>

      <Footer />
    </main>
  );
};