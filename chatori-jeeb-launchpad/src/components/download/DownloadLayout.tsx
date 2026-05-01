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
  hero?: ReactNode;
};

export const DownloadLayout = ({ title, eyebrow = "Download", description, path, children, hero }: Props) => {
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

      <section className="pt-32 pb-12 md:pt-40 md:pb-20 bg-gradient-warm border-b border-border">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-4 animate-fade-in">
            <Link to="/" className="hover:text-primary-deep transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/download" className="hover:text-primary-deep transition-colors">Download</Link>
            {path !== "/download" && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium">{title}</span>
              </>
            )}
          </nav>
          <div className="animate-fade-in">
            <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">{eyebrow}</span>
            <h1 className="mt-2 text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">{title}</h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl">{description}</p>
          </div>
          {hero ? <div className="mt-8">{hero}</div> : null}
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">{children}</div>
      </section>

      <Footer />
    </main>
  );
};