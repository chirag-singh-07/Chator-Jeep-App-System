import { useMemo, useState, useEffect } from "react";
import { SupportLayout } from "@/components/support/SupportLayout";
import { Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Faq = { q: string; a: string };
type Category = { id: string; label: string; emoji: string; faqs: Faq[] };

const categories: Category[] = [
  {
    id: "ordering",
    label: "Ordering Issues",
    emoji: "🍔",
    faqs: [
      { q: "How do I place an order?", a: "Open the app, choose a restaurant, add items to your cart, and tap Checkout. You can pay using UPI, cards, wallets, or cash on delivery." },
      { q: "Can I edit my order after placing it?", a: "Orders can be edited within the first 60 seconds. After that, please contact support." },
      { q: "How do I cancel an order?", a: "Go to your active order screen and tap Cancel. Cancellations after preparation has started may incur a small charge." },
      { q: "Can I schedule an order in advance?", a: "Yes — choose 'Schedule for later' at checkout and pick a delivery time slot up to 7 days in advance." },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    emoji: "💳",
    faqs: [
      { q: "What payment methods are accepted?", a: "UPI, credit/debit cards, popular wallets (Paytm, PhonePe, GPay), Chatori Wallet, and cash on delivery." },
      { q: "When will I receive my refund?", a: "Approved refunds reflect on your original payment method within 5–7 business days." },
      { q: "I was charged but my order failed — what now?", a: "Don't worry. Failed orders are auto-refunded within 24 hours. If not, please contact support with your transaction ID." },
      { q: "Are my payments secure?", a: "All payments are processed via PCI-DSS compliant gateways with end-to-end encryption. We never store your card details." },
    ],
  },
  {
    id: "delivery",
    label: "Delivery Issues",
    emoji: "🛵",
    faqs: [
      { q: "My order is late — what should I do?", a: "Check live tracking in the app. If it's significantly delayed, contact support and we'll investigate or compensate appropriately." },
      { q: "I received the wrong item.", a: "Tap 'Report Issue' on your order page within 24 hours, attach a photo, and we'll process a refund or replacement." },
      { q: "How do I contact my delivery partner?", a: "Tap the rider's name on the live tracking screen to call or chat in-app — your number stays private." },
      { q: "Can I change my delivery address?", a: "Address changes are possible only before the rider is assigned. Otherwise, contact support." },
    ],
  },
  {
    id: "account",
    label: "Account Problems",
    emoji: "👤",
    faqs: [
      { q: "I forgot my password.", a: "Tap 'Forgot password' on the login screen and follow the email link to reset it." },
      { q: "How do I delete my account?", a: "Go to Profile → Settings → Delete Account. Your data is removed within 30 days as per our Privacy Policy." },
      { q: "How do I update my phone number?", a: "Profile → Edit Profile → Phone. We'll send an OTP to verify the new number." },
      { q: "Can I have multiple addresses saved?", a: "Yes — save up to 10 addresses (Home, Work, Other) for quick checkout." },
    ],
  },
];

export default function HelpCenter() {
  const [activeCat, setActiveCat] = useState<string>(categories[0].id);
  const [query, setQuery] = useState("");

  // Pick up ?q=… from Support hub search.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q.slice(0, 200));
  }, []);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return categories.find((c) => c.id === activeCat)?.faqs ?? [];
    return categories
      .flatMap((c) => c.faqs)
      .filter((f) => f.q.toLowerCase().includes(trimmed) || f.a.toLowerCase().includes(trimmed));
  }, [query, activeCat]);

  const isSearching = query.trim().length > 0;

  return (
    <SupportLayout
      title="Help Center"
      eyebrow="FAQs & Guides"
      description="Find quick answers to the most common questions about Chatori Jeeb."
      path="/help"
      headerExtra={
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 200))}
            placeholder="Search FAQs…"
            aria-label="Search FAQs"
            maxLength={200}
            className="w-full h-14 pl-12 pr-4 rounded-full bg-card border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary text-base"
          />
        </div>
      }
    >
      {!isSearching && (
        <div className="flex flex-wrap gap-2 mb-8 sticky top-20 z-20 bg-background/80 backdrop-blur-md py-3 -mx-4 px-4 rounded-xl">
          {categories.map((c) => {
            const isActive = activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`px-4 h-10 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "bg-card border border-border text-foreground hover:border-primary/50"
                }`}
              >
                <span className="mr-1.5">{c.emoji}</span>
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No results for "<strong className="text-foreground">{query}</strong>". Try a different keyword or{" "}
          <a href="/contact" className="text-primary-deep font-semibold hover:underline">contact us</a>.
        </div>
      ) : (
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card divide-y divide-border">
          {filtered.map((f, i) => (
            <AccordionItem key={`${f.q}-${i}`} value={`q-${i}`} className="border-0 px-5">
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="mt-12 rounded-2xl bg-gradient-warm border border-border p-6 md:p-8 text-center">
        <h3 className="text-xl font-bold">Still need help?</h3>
        <p className="mt-2 text-muted-foreground">Our team responds within 24 hours.</p>
        <a
          href="/contact"
          className="inline-block mt-4 h-11 px-6 leading-[44px] rounded-full bg-gradient-primary text-primary-foreground font-bold shadow-glow hover:scale-[1.03] transition-transform"
        >
          Contact support
        </a>
      </div>
    </SupportLayout>
  );
}