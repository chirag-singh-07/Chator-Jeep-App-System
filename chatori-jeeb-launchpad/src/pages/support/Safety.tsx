import { SupportLayout } from "@/components/support/SupportLayout";
import { ShieldCheck, UtensilsCrossed, Lock, Phone, BikeIcon, BadgeCheck } from "lucide-react";

const pillars = [
  {
    icon: BikeIcon,
    title: "Rider Safety",
    desc: "Background-verified riders, real-time GPS, mandatory helmets, accident insurance, and a 24/7 SOS button in the rider app.",
  },
  {
    icon: UtensilsCrossed,
    title: "Food Hygiene",
    desc: "Every restaurant is FSSAI-licensed. We conduct surprise hygiene audits, tamper-evident packaging, and contactless handover.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    desc: "PCI-DSS compliant gateways, end-to-end encryption, OTP-based authentication, and zero card storage on our servers.",
  },
  {
    icon: Phone,
    title: "Number Masking",
    desc: "Your phone number stays private — calls and chats with riders go through a masked Chatori Jeeb number.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Restaurants",
    desc: "Onboarding requires valid licenses, GST registration, and on-site kitchen verification before going live.",
  },
  {
    icon: ShieldCheck,
    title: "24/7 Support",
    desc: "Live human support around the clock for emergencies, complaints, and immediate refunds.",
  },
];

export default function Safety() {
  return (
    <SupportLayout
      title="Safety & Trust"
      eyebrow="Our commitments"
      description="Your safety — and your food's safety — is non-negotiable. Here's how we protect everyone on the platform."
      path="/safety"
    >
      <div className="grid md:grid-cols-2 gap-5">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-border bg-card p-6 hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <span className="h-12 w-12 rounded-xl bg-primary/15 text-primary-deep flex items-center justify-center">
                <p.icon className="h-6 w-6" />
              </span>
              <h2 className="text-xl font-bold">{p.title}</h2>
            </div>
            <p className="mt-4 text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Emergency block */}
      <div className="mt-12 rounded-3xl border border-destructive/30 bg-destructive/5 p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Phone className="h-6 w-6 text-destructive" />
          Emergency support
        </h2>
        <p className="mt-3 text-muted-foreground">
          If you or someone you know is in immediate danger during a delivery, please call local emergency services first.
        </p>
        <ul className="mt-4 grid sm:grid-cols-3 gap-4">
          <li className="rounded-xl bg-card border border-border p-4">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Police</div>
            <a href="tel:100" className="text-2xl font-extrabold text-foreground">100</a>
          </li>
          <li className="rounded-xl bg-card border border-border p-4">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Ambulance</div>
            <a href="tel:108" className="text-2xl font-extrabold text-foreground">108</a>
          </li>
          <li className="rounded-xl bg-card border border-border p-4">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Chatori Jeeb 24/7</div>
            <a href="tel:18001232428" className="text-lg font-extrabold text-foreground">1800-123-CHAT</a>
          </li>
        </ul>
      </div>
    </SupportLayout>
  );
}