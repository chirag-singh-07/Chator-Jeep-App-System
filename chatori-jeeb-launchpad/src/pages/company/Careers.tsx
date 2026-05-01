import { CompanyLayout } from "@/components/company/CompanyLayout";
import { Button } from "@/components/ui/button";
import { Heart, Rocket, Clock, TrendingUp, MapPin } from "lucide-react";

const benefits = [
  { Icon: Clock, title: "Flexible work", text: "Hybrid schedules and outcome-driven culture." },
  { Icon: TrendingUp, title: "Growth opportunities", text: "Clear career paths and learning budgets." },
  { Icon: Rocket, title: "Startup energy", text: "Fast decisions, big ownership, real impact." },
  { Icon: Heart, title: "People first", text: "Health insurance, wellness and meal credits." },
];

const jobs = [
  { title: "Senior Frontend Engineer", location: "Bengaluru / Remote", team: "Engineering" },
  { title: "Product Designer", location: "Bengaluru", team: "Design" },
  { title: "City Operations Manager", location: "Mumbai", team: "Operations" },
  { title: "Restaurant Partnerships Lead", location: "Delhi NCR", team: "Growth" },
  { title: "Data Analyst", location: "Remote, India", team: "Analytics" },
];

const Careers = () => {
  return (
    <CompanyLayout
      title="Careers at Chatori Jeeb"
      eyebrow="Careers"
      description="Join Chatori Jeeb and help build India's most chatori food delivery platform. Explore open roles across engineering, design, operations and more."
      path="/careers"
    >
      <section aria-labelledby="why" className="mb-14">
        <h2 id="why" className="text-2xl md:text-3xl font-extrabold">Why work with us</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          We're a small, ambitious team that takes food, technology and craft seriously. Expect ownership from day one,
          mentors who've built at scale, and a culture that respects your time.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="open-roles">
        <h2 id="open-roles" className="text-2xl md:text-3xl font-extrabold">Open roles</h2>
        <div className="mt-6 space-y-4">
          {jobs.map((job) => (
            <article key={job.title} className="rounded-2xl border border-border bg-card p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-primary/60 hover:shadow-elegant transition-all">
              <div>
                <h3 className="text-lg font-bold">{job.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground/70 text-xs font-medium">{job.team}</span>
                </div>
              </div>
              <Button asChild>
                <a href="mailto:careers@chatorijeeb.com?subject=Application: {job.title}">Apply now</a>
              </Button>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gradient-primary p-8 md:p-10 text-primary-foreground text-center shadow-elegant">
          <h3 className="text-2xl md:text-3xl font-extrabold">Don't see your role?</h3>
          <p className="mt-2 opacity-90 max-w-xl mx-auto">We're always looking for great people. Send us your story.</p>
          <Button asChild variant="secondary" className="mt-6">
            <a href="mailto:careers@chatorijeeb.com">Join Chatori Jeeb Team</a>
          </Button>
        </div>
      </section>
    </CompanyLayout>
  );
};

export default Careers;