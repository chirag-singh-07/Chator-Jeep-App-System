import { DownloadLayout } from "@/components/download/DownloadLayout";
import { StoreButtons } from "@/components/download/StoreButtons";
import { PhoneMockup } from "@/components/download/PhoneMockup";
import { ClipboardList, BarChart3, Users, FileText, Store, Receipt } from "lucide-react";

const features = [
  { Icon: ClipboardList, title: "Order management", text: "Accept, prepare and dispatch — all from one screen." },
  { Icon: BarChart3, title: "Analytics dashboard", text: "Track sales, top items and customer trends in real time." },
  { Icon: Users, title: "Customer reach", text: "Get discovered by millions of hungry chatoris near you." },
];

const stats = [
  { value: "3x", label: "Avg orders growth" },
  { value: "₹2L+", label: "Monthly revenue lift" },
  { value: "50+", label: "Cities & growing" },
];

const steps = [
  { Icon: FileText, title: "Register", text: "Quick onboarding with FSSAI and bank details." },
  { Icon: Store, title: "List your menu", text: "Upload dishes, photos and pricing in minutes." },
  { Icon: Receipt, title: "Start receiving orders", text: "Go live and start delighting customers." },
];

const RestaurantApp = () => {
  return (
    <DownloadLayout
      title="Grow Your Restaurant Business"
      eyebrow="Restaurant App"
      description="Manage orders, menus and analytics with the Chatori Jeeb restaurant app. Reach millions of customers across India."
      path="/app/restaurant"
      hero={
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <StoreButtons />
            <p className="mt-4 text-sm text-muted-foreground">Free to list. Pay only when you grow.</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <PhoneMockup label="Restaurant app preview" />
          </div>
        </div>
      }
    >
      <section aria-labelledby="features">
        <h2 id="features" className="text-2xl md:text-3xl font-extrabold">Everything you need to run your kitchen</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {features.map(({ Icon, title, text }, i) => (
            <div
              key={title}
              style={{ animationDelay: `${i * 80}ms` }}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="growth" className="mt-20">
        <h2 id="growth" className="text-2xl md:text-3xl font-extrabold">Partners are growing with us</h2>
        <div className="mt-6 grid sm:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-gradient-warm border border-border p-6 text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-foreground">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="how" className="mt-20">
        <h2 id="how" className="text-2xl md:text-3xl font-extrabold">How it works</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {steps.map(({ Icon, title, text }, i) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground font-bold">{i + 1}</span>
                <Icon className="h-5 w-5 text-primary-deep" />
              </div>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl bg-gradient-primary text-primary-foreground p-10 md:p-14 text-center shadow-elegant">
        <h2 className="text-3xl md:text-4xl font-extrabold">Partner with Chatori Jeeb</h2>
        <p className="mt-3 opacity-90 max-w-xl mx-auto">List your restaurant and start receiving orders from chatoris in your city.</p>
        <div className="mt-6"><StoreButtons align="center" /></div>
      </section>
    </DownloadLayout>
  );
};

export default RestaurantApp;