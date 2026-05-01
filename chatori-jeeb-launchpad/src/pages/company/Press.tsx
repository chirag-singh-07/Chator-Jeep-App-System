import { CompanyLayout } from "@/components/company/CompanyLayout";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Building2, Users } from "lucide-react";

const mentions = [
  { outlet: "YourStory", title: "Chatori Jeeb crosses 2M orders in record time", date: "Mar 2026" },
  { outlet: "Inc42", title: "How Chatori Jeeb is reimagining food delivery for Bharat", date: "Jan 2026" },
  { outlet: "Economic Times", title: "Chatori Jeeb expands to 50+ cities across India", date: "Nov 2025" },
  { outlet: "Mint", title: "The rise of regional food platforms: a Chatori Jeeb case study", date: "Sep 2025" },
];

const facts = [
  { Icon: Calendar, label: "Founded", value: "2024" },
  { Icon: Building2, label: "Headquarters", value: "Bengaluru, India" },
  { Icon: Users, label: "Team size", value: "200+" },
];

const Press = () => {
  return (
    <CompanyLayout
      title="Press & Media"
      eyebrow="Press"
      description="Latest news, press mentions and brand resources from Chatori Jeeb. Download our media kit and reach our press team."
      path="/press"
    >
      <section aria-labelledby="facts">
        <h2 id="facts" className="text-2xl md:text-3xl font-extrabold">Company at a glance</h2>
        <div className="mt-6 grid sm:grid-cols-3 gap-6">
          {facts.map(({ Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="h-5 w-5 text-primary-deep" />
              <div className="mt-3 text-2xl font-extrabold">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="mentions" className="mt-14">
        <h2 id="mentions" className="text-2xl md:text-3xl font-extrabold">In the news</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {mentions.map((m) => (
            <article key={m.title} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-shadow">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="font-semibold text-primary-deep">{m.outlet}</span>
                <span>{m.date}</span>
              </div>
              <h3 className="mt-2 text-lg font-bold leading-snug">{m.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl bg-gradient-warm border border-border p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Media kit</h2>
          <p className="mt-2 text-muted-foreground max-w-xl">Logos, brand colors and product screenshots for press use.</p>
        </div>
        <Button asChild size="lg">
          <a href="mailto:press@chatorijeeb.com?subject=Media Kit Request">
            <Download className="h-4 w-4" /> Download media kit
          </a>
        </Button>
      </section>
    </CompanyLayout>
  );
};

export default Press;