import { Link } from "react-router-dom";
import { CompanyLayout } from "@/components/company/CompanyLayout";
import { Users, Briefcase, Newspaper, BookOpen, ArrowRight } from "lucide-react";

const cards = [
  { to: "/about", title: "About Us", desc: "Our mission, vision and the story behind Chatori Jeeb.", Icon: Users },
  { to: "/careers", title: "Careers", desc: "Join a fast-moving team building India's chatori food platform.", Icon: Briefcase },
  { to: "/press", title: "Press & Media", desc: "Latest news, brand assets and media resources.", Icon: Newspaper },
  { to: "/blog", title: "Blog", desc: "Food trends, partner stories and our startup journey.", Icon: BookOpen },
];

const Company = () => {
  return (
    <CompanyLayout
      title="Building India's most chatori food platform"
      eyebrow="Company"
      description="Get to know Chatori Jeeb — the people, the mission, and the journey of building a delightful food delivery experience for India."
      path="/company"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        {cards.map(({ to, title, desc, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-border bg-card p-6 md:p-8 hover:border-primary/60 hover:shadow-elegant transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                <p className="mt-1 text-muted-foreground">{desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-deep">
                  Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </CompanyLayout>
  );
};

export default Company;