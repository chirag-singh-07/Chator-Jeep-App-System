import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ChevronRight } from "lucide-react";

export type LegalSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type Props = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
  /** Path used for canonical URL, e.g. "/privacy" */
  path: string;
};

export const LegalLayout = ({ title, description, lastUpdated, sections, path }: Props) => {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  // SEO meta
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
    setMeta("og:type", "article", "property");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + path;
  }, [title, description, path]);

  // Active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-warm border-b border-border">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary-deep transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/legal" className="hover:text-primary-deep transition-colors">Legal</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{title}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{title}</h1>
          <p className="mt-3 text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-12 max-w-6xl mx-auto">
            {/* Sticky TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary-deep mb-4">
                  On this page
                </h2>
                <ul className="space-y-1 text-sm border-l border-border">
                  {sections.map((s) => {
                    const isActive = active === s.id;
                    return (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className={`block -ml-px pl-4 py-1.5 border-l-2 transition-colors ${
                            isActive
                              ? "border-primary text-primary-deep font-semibold"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>

            {/* Article */}
            <article className="prose-legal max-w-2xl">
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24 mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">{s.title}</h2>
                  <div className="space-y-4 text-base leading-relaxed text-foreground/85">
                    {s.content}
                  </div>
                </section>
              ))}

              <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
                Questions? Reach out at{" "}
                <a href="mailto:legal@chatorijeeb.com" className="text-primary-deep font-semibold hover:underline">
                  legal@chatorijeeb.com
                </a>.
              </div>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};