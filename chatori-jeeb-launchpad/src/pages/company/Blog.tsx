import { useMemo, useState } from "react";
import { CompanyLayout } from "@/components/company/CompanyLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Food trends" | "Startup journey" | "Partner stories";
  date: string;
  readMins: number;
};

const posts: Post[] = [
  { slug: "monsoon-food-cravings", title: "Monsoon food cravings: what India is ordering", excerpt: "From pakoras to chai — a look at India's monsoon order data.", category: "Food trends", date: "Apr 12, 2026", readMins: 4 },
  { slug: "scaling-to-50-cities", title: "Scaling Chatori Jeeb to 50+ cities", excerpt: "Lessons from going beyond metros into Bharat.", category: "Startup journey", date: "Mar 28, 2026", readMins: 6 },
  { slug: "rider-stories-mumbai", title: "Rider stories: a day with our Mumbai partners", excerpt: "Meet the chatori riders keeping the city fed.", category: "Partner stories", date: "Mar 10, 2026", readMins: 5 },
  { slug: "biryani-belt-of-india", title: "The biryani belt of India", excerpt: "Mapping India's most ordered biryanis, region by region.", category: "Food trends", date: "Feb 22, 2026", readMins: 7 },
  { slug: "fundraise-series-a", title: "Why we raised our Series A", excerpt: "Inside our fundraise and what's next for the team.", category: "Startup journey", date: "Feb 02, 2026", readMins: 5 },
  { slug: "tier3-restaurant-wins", title: "How a tier-3 restaurant 3x'd orders", excerpt: "A partner success story from Indore.", category: "Partner stories", date: "Jan 18, 2026", readMins: 4 },
];

const categories = ["All", "Food trends", "Startup journey", "Partner stories"] as const;

const Blog = () => {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [visible, setVisible] = useState(6);

  const filtered = useMemo(
    () => (active === "All" ? posts : posts.filter((p) => p.category === active)),
    [active]
  );

  return (
    <CompanyLayout
      title="Chatori Jeeb Blog"
      eyebrow="Blog"
      description="Food trends, startup journey and partner stories from the Chatori Jeeb team."
      path="/blog"
    >
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => { setActive(c); setVisible(6); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              active === c
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground/80 border-border hover:border-primary/60"
            }`}
            aria-pressed={active === c}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.slice(0, visible).map((p) => (
          <article key={p.slug} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elegant hover:border-primary/60 transition-all">
            <div className="aspect-[16/10] bg-gradient-warm overflow-hidden">
              <div className="h-full w-full bg-gradient-primary opacity-90 group-hover:scale-105 transition-transform duration-500" aria-hidden />
            </div>
            <div className="p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-deep">{p.category}</span>
              <h2 className="mt-2 text-lg font-bold leading-snug">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.date} · {p.readMins} min read</span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary-deep">
                  Read more <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {visible < filtered.length && (
        <div className="mt-10 text-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + 6)}>Load more</Button>
        </div>
      )}

      <section className="mt-16 rounded-2xl bg-gradient-warm border border-border p-8 md:p-10 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold">Get the chatori newsletter</h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Monthly food trends, partner stories and behind-the-scenes from our team.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); }}
          className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <label htmlFor="newsletter-email" className="sr-only">Email</label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="you@email.com"
            className="flex-1 rounded-full px-5 py-3 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" size="lg">Subscribe</Button>
        </form>
      </section>
    </CompanyLayout>
  );
};

export default Blog;