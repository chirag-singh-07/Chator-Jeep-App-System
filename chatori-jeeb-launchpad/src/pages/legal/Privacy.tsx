import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <p>
        Chatori Jeeb ("we", "us") respects your privacy. This Privacy Policy explains what data we
        collect, how we use it, and the choices you have.
      </p>
    ),
  },
  {
    id: "data-collection",
    title: "2. Data We Collect",
    content: (
      <>
        <p>We collect the following categories of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account data:</strong> name, phone number, email address, password.</li>
          <li><strong>Location data:</strong> delivery address, real-time GPS for tracking.</li>
          <li><strong>Order data:</strong> items ordered, payment method, order history.</li>
          <li><strong>Device data:</strong> device type, OS, IP address, browser information.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-usage",
    title: "3. How We Use Your Data",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>To process and deliver your orders.</li>
        <li>To provide customer support and resolve disputes.</li>
        <li>To personalize recommendations and offers.</li>
        <li>To detect fraud and ensure platform safety.</li>
        <li>To send service updates and (with your consent) marketing communications.</li>
      </ul>
    ),
  },
  {
    id: "third-party",
    title: "4. Third-Party Sharing",
    content: (
      <>
        <p>We share data with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Restaurants — to fulfil your order.</li>
          <li>Delivery partners — to complete delivery.</li>
          <li>Payment processors — to handle transactions securely.</li>
          <li>Analytics providers — to improve the Service.</li>
        </ul>
        <p>We never sell your personal data to advertisers.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "5. Cookies",
    content: (
      <p>
        We use cookies and similar technologies to remember preferences and analyze usage. See our{" "}
        <a href="/cookies" className="text-primary-deep font-semibold hover:underline">Cookies Policy</a>{" "}
        for details.
      </p>
    ),
  },
  {
    id: "security",
    title: "6. Data Security",
    content: (
      <p>
        We use industry-standard encryption (TLS), access controls, and regular security audits to
        protect your data. No system is 100% secure, but we work hard to keep yours safe.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    content: (
      <>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Withdraw consent for marketing communications.</li>
          <li>Export your data in a portable format.</li>
        </ul>
        <p>
          To exercise these rights, email{" "}
          <a href="mailto:privacy@chatorijeeb.com" className="text-primary-deep font-semibold hover:underline">
            privacy@chatorijeeb.com
          </a>.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "8. Data Retention",
    content: (
      <p>
        We retain personal data only as long as needed to provide the Service or comply with legal
        obligations. Order records are kept for up to 7 years for tax and accounting purposes.
      </p>
    ),
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy occasionally. Material changes will be communicated via
        email or in-app notification.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="Learn how Chatori Jeeb collects, uses, and protects your personal data, including location, orders, and account information."
      lastUpdated="May 1, 2026"
      path="/privacy"
      sections={sections}
    />
  );
}