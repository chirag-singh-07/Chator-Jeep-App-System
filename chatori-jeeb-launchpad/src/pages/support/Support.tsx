import { useState } from "react";
import { Link } from "react-router-dom";
import { SupportLayout } from "@/components/support/SupportLayout";
import { LifeBuoy, MessageCircle, Shield, HandshakeIcon, Search, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const cards = [
  { title: "Help Center", desc: "Browse FAQs about orders, payments, delivery, and accounts.", href: "/help", icon: LifeBuoy },
  { title: "Contact Us", desc: "Reach our support team via form, WhatsApp, email, or phone.", href: "/contact", icon: MessageCircle },
  { title: "Safety & Trust", desc: "Learn how we keep customers, riders, and food safe.", href: "/safety", icon: Shield },
  { title: "Partner Help", desc: "Support for delivery riders and restaurant partners.", href: "/partner-help", icon: HandshakeIcon },
];

const quickFaqs = [
  { q: "How do I track my order?", a: "Open the Chatori Jeeb app, tap your active order, and you'll see real-time tracking with the rider's location." },
  { q: "How do I cancel an order?", a: "Orders can be cancelled within the first 60 seconds of placing them. After that, contact support for assistance." },
  { q: "When will I receive my refund?", a: "Approved refunds reflect on your original payment method within 5–7 business days." },
  { q: "How do I become a delivery partner?", a: "Visit our Partner Help page, fill out the rider sign-up form, and we'll get you onboarded in a few days." },
];

export default function Support() {
  const [query, setQuery] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lightweight client-side redirect to help center with query
    const q = encodeURIComponent(query.trim());
    if (q) window.location.href = `/help?q=${q}`;
  };

  return (
    <SupportLayout
      title="How can we help you?"
      eyebrow="Support Hub"
      description="Find answers, talk to our team, or get partner support — all in one place."
      path="/support"
      headerExtra={
        <form onSubmit={onSubmit} className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 200))}
            placeholder="Search help articles…"
            aria-label="Search help articles"
            maxLength={200}
            className="w-full h-14 pl-12 pr-32 rounded-full bg-card border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary text-base"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.03] transition-transform"
          >
            Search
          </button>
        </form>
      }
    >
      <div className="grid sm:grid-cols-2 gap-5 mb-16">
        {cards.map((c) => (
          <Link
            key={c.href}
            to={c.href}
            className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <span className="h-12 w-12 rounded-xl bg-primary/15 text-primary-deep flex items-center justify-center">
                <c.icon className="h-6 w-6" />
              </span>
              <h2 className="text-xl font-bold">{c.title}</h2>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{c.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-deep group-hover:gap-2 transition-all">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Quick FAQs</h2>
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card divide-y divide-border">
          {quickFaqs.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="border-0 px-5">
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-6 text-sm text-muted-foreground">
          Can't find what you're looking for?{" "}
          <Link to="/contact" className="text-primary-deep font-semibold hover:underline">Contact our team →</Link>
        </div>
      </div>
    </SupportLayout>
  );
}