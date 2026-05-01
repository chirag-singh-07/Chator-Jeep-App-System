import { CompanyLayout } from "@/components/company/CompanyLayout";
import { Target, Eye, Sparkles, MapPin, ShoppingBag, Bike } from "lucide-react";

const stats = [
  { Icon: MapPin, label: "Cities served", value: "50+" },
  { Icon: ShoppingBag, label: "Orders delivered", value: "2M+" },
  { Icon: Bike, label: "Active partners", value: "10K+" },
];

const pillars = [
  { Icon: Target, title: "Mission", text: "Make food delivery fast, reliable and rewarding for every Indian household." },
  { Icon: Eye, title: "Vision", text: "Be the most loved food platform across India — from metros to tier-3 towns." },
  { Icon: Sparkles, title: "Story", text: "Chatori Jeeb started with a simple idea: bring the chatori in all of us closer to the food we crave." },
];

const About = () => {
  return (
    <CompanyLayout
      title="About Chatori Jeeb"
      eyebrow="About"
      description="Learn about Chatori Jeeb, India's growing food delivery platform connecting users, delivery partners, and restaurants."
      path="/about"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {pillars.map(({ Icon, title, text }) => (
          <article key={title} className="rounded-2xl border border-border bg-card p-6 md:p-8 hover:shadow-elegant transition-shadow">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-xl font-bold">{title}</h2>
            <p className="mt-2 text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>

      <section aria-labelledby="stats" className="mt-16">
        <h2 id="stats" className="text-2xl md:text-3xl font-extrabold">Our impact so far</h2>
        <div className="mt-6 grid sm:grid-cols-3 gap-6">
          {stats.map(({ Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-gradient-warm border border-border p-6 text-center">
              <Icon className="h-6 w-6 mx-auto text-primary-deep" />
              <div className="mt-3 text-4xl font-extrabold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="story" className="mt-16">
        <h2 id="story" className="text-2xl md:text-3xl font-extrabold">The Chatori Jeeb story</h2>
        <div className="mt-4 prose prose-neutral max-w-none text-muted-foreground space-y-4">
          <p>
            We started Chatori Jeeb because food in India deserved a delivery experience as joyful as the food itself.
            From late-night biryani cravings to weekend chaat runs, our platform is built to celebrate every chatori moment.
          </p>
          <p>
            Today, thousands of restaurants and delivery partners trust Chatori Jeeb to grow their business while we serve
            millions of customers across 50+ cities. We're just getting started.
          </p>
        </div>
      </section>
    </CompanyLayout>
  );
};

export default About;