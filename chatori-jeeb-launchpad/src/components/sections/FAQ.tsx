import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  { q: "How do I place an order on Chatori Jeeb?", a: "Open the app, allow location, browse restaurants near you, add items to cart, and checkout. Your food arrives within 30 minutes on average." },
  { q: "How can I become a delivery partner?", a: "Sign up via the Delivery Partner app with your Aadhaar and bank details. Onboarding is fully digital and takes under 10 minutes. Start earning the same day." },
  { q: "Which payment methods do you support?", a: "UPI, all major credit/debit cards, net banking, and cash on delivery — pick whatever's most convenient for you." },
  { q: "How do restaurants list with Chatori Jeeb?", a: "Visit the partner portal, fill out a 5-minute form, and our onboarding team handles photos, menu setup, and launch — usually within 48 hours." },
  { q: "Is there a delivery fee?", a: "Delivery fees vary by distance and order size. Most orders ship for ₹19–₹49, and Chatori Jeeb Plus members get free delivery on every order." },
  { q: "What if my order is late or wrong?", a: "Tap 'Help' inside the order screen — our 24/7 support team will refund or reorder instantly. We stand by every meal we deliver." },
];

export const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-32 bg-gradient-warm">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">FAQ</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Questions, answered</h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border transition-colors overflow-hidden ${isOpen ? "border-primary/50 bg-card shadow-card" : "border-border bg-card/60"}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-base md:text-lg">{f.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${isOpen ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}
                  >
                    <Plus className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-6 text-muted-foreground leading-relaxed">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
