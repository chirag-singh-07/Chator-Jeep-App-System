import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "1. What Are Cookies?",
    content: (
      <p>
        Cookies are small text files stored on your device when you visit a website. They help
        websites remember information about your visit — like your preferred language and login
        state — making your next visit easier and more useful.
      </p>
    ),
  },
  {
    id: "types",
    title: "2. Types of Cookies We Use",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Essential cookies:</strong> required for core functionality like login and
          checkout. These cannot be disabled.
        </li>
        <li>
          <strong>Preference cookies:</strong> remember your settings (language, location, theme).
        </li>
        <li>
          <strong>Analytics cookies:</strong> help us understand how the Service is used so we can
          improve it.
        </li>
        <li>
          <strong>Marketing cookies:</strong> used to show relevant offers and measure campaign
          performance.
        </li>
      </ul>
    ),
  },
  {
    id: "third-party",
    title: "3. Third-Party Cookies",
    content: (
      <p>
        Some cookies are set by third-party services we use (such as analytics or payment
        providers). These providers have their own privacy and cookie policies.
      </p>
    ),
  },
  {
    id: "manage",
    title: "4. How to Manage Cookies",
    content: (
      <>
        <p>
          You can control cookies through your browser settings. Most browsers let you block, delete,
          or be alerted to cookies.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Chrome: Settings → Privacy and security → Cookies and other site data</li>
          <li>Safari: Preferences → Privacy → Manage Website Data</li>
          <li>Firefox: Preferences → Privacy & Security → Cookies and Site Data</li>
        </ul>
        <p>
          Note: blocking essential cookies may break parts of the Service (e.g., you may be unable to
          log in).
        </p>
      </>
    ),
  },
  {
    id: "consent",
    title: "5. Your Consent",
    content: (
      <p>
        By continuing to use Chatori Jeeb, you consent to our use of cookies as described in this
        policy. You can withdraw consent at any time by clearing cookies in your browser.
      </p>
    ),
  },
];

export default function Cookies() {
  return (
    <LegalLayout
      title="Cookies Policy"
      description="Learn what cookies Chatori Jeeb uses, why we use them, and how you can manage cookies in your browser."
      lastUpdated="May 1, 2026"
      path="/cookies"
      sections={sections}
    />
  );
}