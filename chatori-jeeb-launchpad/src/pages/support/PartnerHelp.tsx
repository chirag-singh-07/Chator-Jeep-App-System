import { SupportLayout } from "@/components/support/SupportLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bike, Store, Wallet, ClipboardList, Rocket, Headphones } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const riderSteps = [
  { icon: ClipboardList, title: "How to join", desc: "Submit your driving license, ID proof, and vehicle documents via the partner app. Approval typically takes 2–3 business days." },
  { icon: Wallet, title: "Earnings", desc: "Earn per delivery + distance + peak-hour bonuses. Daily payouts go directly to your linked bank account." },
  { icon: Headphones, title: "Issue support", desc: "In-app chat with the partner team is available 24/7 for accidents, account issues, and payment queries." },
];

const restaurantSteps = [
  { icon: ClipboardList, title: "Onboarding", desc: "Share your menu, FSSAI license, GST, and bank details. Our team handles photography and listing setup." },
  { icon: Rocket, title: "Order management", desc: "Use the merchant tablet/web dashboard to accept orders, mark items unavailable, and track real-time analytics." },
  { icon: Wallet, title: "Payments & settlements", desc: "Weekly settlements with a transparent commission breakdown. View invoices and tax reports anytime." },
];

const riderFaqs = [
  { q: "How much can I earn?", a: "Active riders typically earn ₹25,000–₹45,000/month based on hours and city. Peak-hour bonuses can add 20–30% to base earnings." },
  { q: "Do I need my own vehicle?", a: "Yes — a two-wheeler with valid documents (RC, insurance, PUC). We help arrange leases for verified partners in select cities." },
  { q: "How do daily payouts work?", a: "All earnings from a day are transferred to your bank account by 11 AM the next morning." },
];

const restaurantFaqs = [
  { q: "What's the commission rate?", a: "Commissions vary by city and category, typically 18–25%. Detailed terms are in your partner agreement." },
  { q: "How long does onboarding take?", a: "From signup to going live takes 5–7 business days, including menu setup and photography." },
  { q: "Can I run promotions?", a: "Yes — set up flat discounts, BOGO offers, and combo deals from the merchant dashboard. Featured ad slots are also available." },
];

export default function PartnerHelp() {
  return (
    <SupportLayout
      title="Partner Help"
      eyebrow="For riders & restaurants"
      description="Resources, FAQs, and support specifically for our delivery and restaurant partners."
      path="/partner-help"
    >
      <Tabs defaultValue="rider" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 h-12 p-1 bg-secondary rounded-full">
          <TabsTrigger value="rider" className="rounded-full data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
            <Bike className="h-4 w-4 mr-2" /> Delivery Partner
          </TabsTrigger>
          <TabsTrigger value="restaurant" className="rounded-full data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
            <Store className="h-4 w-4 mr-2" /> Restaurant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rider" className="space-y-10 animate-fade-in">
          <div className="grid md:grid-cols-3 gap-5">
            {riderSteps.map((s) => (
              <StepCard key={s.title} {...s} />
            ))}
          </div>
          <FaqList faqs={riderFaqs} title="Delivery partner FAQs" />
        </TabsContent>

        <TabsContent value="restaurant" className="space-y-10 animate-fade-in">
          <div className="grid md:grid-cols-3 gap-5">
            {restaurantSteps.map((s) => (
              <StepCard key={s.title} {...s} />
            ))}
          </div>
          <FaqList faqs={restaurantFaqs} title="Restaurant FAQs" />
        </TabsContent>
      </Tabs>

      <div className="mt-14 rounded-2xl bg-gradient-warm border border-border p-6 md:p-8 text-center">
        <h3 className="text-xl font-bold">Need 1-on-1 partner support?</h3>
        <p className="mt-2 text-muted-foreground">
          Email us at{" "}
          <a href="mailto:partners@chatorijeeb.com" className="text-primary-deep font-semibold hover:underline">
            partners@chatorijeeb.com
          </a>{" "}
          or call <a href="tel:18001232428" className="text-primary-deep font-semibold hover:underline">1800-123-CHAT</a>.
        </p>
      </div>
    </SupportLayout>
  );
}

function StepCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
      <span className="h-12 w-12 rounded-xl bg-primary/15 text-primary-deep flex items-center justify-center mb-4">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function FaqList({ title, faqs }: { title: string; faqs: { q: string; a: string }[] }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-5">{title}</h3>
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card divide-y divide-border">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q-${i}`} className="border-0 px-5">
            <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}