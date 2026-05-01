import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SupportLayout } from "@/components/support/SupportLayout";
import { Mail, Phone, MessageCircle, CheckCircle2 } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Please enter a valid phone number"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message is too long (max 1000 chars)"),
});

type FormData = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormData, string>>;

export default function Contact() {
  const [data, setData] = useState<FormData>({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: string) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Errors = {};
      result.error.issues.forEach((iss) => {
        const field = iss.path[0] as keyof FormData;
        if (field && !fieldErrors[field]) fieldErrors[field] = iss.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    // Simulated submit — replace with API call when backend is ready.
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <SupportLayout
      title="Contact Us"
      eyebrow="Get in touch"
      description="Send us a message and our team will respond within 24 hours."
      path="/contact"
    >
      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        {/* Form */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-8">
              <div className="h-14 w-14 rounded-full bg-primary/15 text-primary-deep flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Message received!</h2>
              <p className="text-muted-foreground max-w-sm">
                Thanks for reaching out. We've sent a confirmation to your email and a team member will respond within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 h-11 rounded-full border border-border font-semibold hover:bg-secondary transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <Field label="Name" htmlFor="name" error={errors.name}>
                <input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  className={inputCls(!!errors.name)}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Email" htmlFor="email" error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => update("email", e.target.value)}
                    maxLength={255}
                    autoComplete="email"
                    className={inputCls(!!errors.email)}
                  />
                </Field>
                <Field label="Phone" htmlFor="phone" error={errors.phone}>
                  <input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    maxLength={20}
                    autoComplete="tel"
                    className={inputCls(!!errors.phone)}
                  />
                </Field>
              </div>

              <Field label="Message" htmlFor="message" error={errors.message}>
                <textarea
                  id="message"
                  rows={5}
                  value={data.message}
                  onChange={(e) => update("message", e.target.value)}
                  maxLength={1000}
                  className={inputCls(!!errors.message) + " resize-y min-h-[120px]"}
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">{data.message.length}/1000</div>
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-gradient-primary text-primary-foreground font-bold shadow-glow hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-transform"
              >
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <ContactCard
            icon={MessageCircle}
            title="WhatsApp"
            value="+91 90000 12345"
            href="https://wa.me/919000012345"
            cta="Chat on WhatsApp"
          />
          <ContactCard
            icon={Mail}
            title="Email"
            value="support@chatorijeeb.com"
            href="mailto:support@chatorijeeb.com"
            cta="Send email"
          />
          <ContactCard
            icon={Phone}
            title="Phone"
            value="1800-123-CHAT (2428)"
            href="tel:18001232428"
            cta="Call now"
          />
          <div className="rounded-2xl border border-border bg-secondary/50 p-5 text-sm text-muted-foreground">
            Support hours: <strong className="text-foreground">8:00 AM – 11:00 PM IST</strong>, all days.
          </div>
        </aside>
      </div>
    </SupportLayout>
  );
}

const inputCls = (hasError: boolean) =>
  `w-full h-11 px-4 rounded-xl border bg-background text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
    hasError ? "border-destructive" : "border-border"
  }`;

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold mb-1.5">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-destructive mt-1.5">{error}</p> : null}
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  value,
  href,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  href: string;
  cta: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
      className="block rounded-2xl border border-border bg-card p-5 hover:shadow-glow hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl bg-primary/15 text-primary-deep flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{title}</div>
          <div className="font-semibold">{value}</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-primary-deep font-semibold">{cta} →</div>
    </a>
  );
}