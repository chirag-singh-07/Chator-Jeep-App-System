import { useEffect, useRef, useState } from "react";
import { DownloadLayout } from "@/components/download/DownloadLayout";
import { StoreButtons } from "@/components/download/StoreButtons";
import { PhoneMockup } from "@/components/download/PhoneMockup";
import { Clock, Wallet, Gift, UserPlus, PackageCheck, Bike } from "lucide-react";

const benefits = [
  { Icon: Clock, title: "Flexible hours", text: "Work when you want — no fixed shifts." },
  { Icon: Wallet, title: "Weekly payouts", text: "Reliable earnings paid every week." },
  { Icon: Gift, title: "Incentives", text: "Bonuses for peak hours and milestones." },
];

const steps = [
  { Icon: UserPlus, title: "Sign up", text: "Register with your basic details and documents." },
  { Icon: PackageCheck, title: "Accept orders", text: "Get nearby orders matched to you instantly." },
  { Icon: Bike, title: "Deliver & earn", text: "Complete deliveries and watch your wallet grow." },
];

const useCounter = (target: number, duration = 1400) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { ref, value };
};

const Counter = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const { ref, value: v } = useCounter(value);
  return (
    <span ref={ref} className="text-4xl md:text-5xl font-extrabold text-foreground">
      {prefix}{v.toLocaleString("en-IN")}{suffix}
    </span>
  );
};

const PartnerApp = () => {
  return (
    <DownloadLayout
      title="Earn on Your Schedule"
      eyebrow="Delivery Partner App"
      description="Join Chatori Jeeb as a delivery partner. Flexible hours, weekly payouts and great incentives — all in one app."
      path="/app/partner"
      hero={
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <StoreButtons />
            <p className="mt-4 text-sm text-muted-foreground">Sign up takes less than 5 minutes.</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <PhoneMockup label="Partner app preview" />
          </div>
        </div>
      }
    >
      <section aria-labelledby="earnings">
        <h2 id="earnings" className="text-2xl md:text-3xl font-extrabold">Real earnings, real freedom</h2>
        <div className="mt-6 grid sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Counter prefix="₹" value={45000} suffix="+" />
            <div className="mt-1 text-sm text-muted-foreground">Avg monthly earnings</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Counter value={10000} suffix="+" />
            <div className="mt-1 text-sm text-muted-foreground">Active partners</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Counter value={50} suffix="+" />
            <div className="mt-1 text-sm text-muted-foreground">Cities live</div>
          </div>
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

      <section aria-labelledby="benefits" className="mt-20">
        <h2 id="benefits" className="text-2xl md:text-3xl font-extrabold">Why partner with Chatori Jeeb</h2>
        <div className="mt-6 grid sm:grid-cols-3 gap-6">
          {benefits.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-shadow">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl bg-gradient-primary text-primary-foreground p-10 md:p-14 text-center shadow-elegant">
        <h2 className="text-3xl md:text-4xl font-extrabold">Ready to ride with us?</h2>
        <p className="mt-3 opacity-90 max-w-xl mx-auto">Download the partner app and start earning on your schedule today.</p>
        <div className="mt-6"><StoreButtons align="center" /></div>
      </section>
    </DownloadLayout>
  );
};

export default PartnerApp;