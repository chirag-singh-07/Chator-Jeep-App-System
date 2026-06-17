import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <p>
        Chatori Jeeb Delivery ("we", "us") respects your privacy. This Privacy Policy explains what data we
        collect from our delivery partners, how we use it, and the choices you have.
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
          <li><strong>Account & Identity data:</strong> name, phone number, email address, ID documents, driving license, vehicle details.</li>
          <li><strong>Location data:</strong> background location and real-time GPS for assigning orders, navigation, and tracking.</li>
          <li><strong>Financial data:</strong> bank account details, payout history, earnings.</li>
          <li><strong>Device data:</strong> device type, OS, app usage metrics.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-usage",
    title: "3. How We Use Your Data",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>To assign delivery requests based on proximity.</li>
        <li>To track delivery progress for customers and restaurants.</li>
        <li>To calculate earnings and process payouts.</li>
        <li>To verify identity and maintain safety standards.</li>
        <li>To communicate essential updates regarding the delivery app.</li>
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
          <li>Customers — live location during an active delivery.</li>
          <li>Restaurants — to facilitate order pickup.</li>
          <li>Payment & Background Check partners — for financial processing and identity verification.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "5. Your Rights",
    content: (
      <>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction or deletion of your data.</li>
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
];

export default function DeliveryPrivacy() {
  return (
    <LegalLayout
      title="Delivery Partner Privacy Policy"
      description="Learn how Chatori Jeeb collects, uses, and protects data for our delivery partners."
      lastUpdated="May 1, 2026"
      path="/delivery-privacy"
      sections={sections}
    />
  );
}
