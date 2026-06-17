import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <p>
        Chatori Jeeb Restaurant ("we", "us") respects your privacy. This Privacy Policy explains what data we
        collect from our restaurant partners, how we use it, and the choices you have.
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
          <li><strong>Business & Account data:</strong> restaurant name, owner details, contact info, FSSAI license, tax details.</li>
          <li><strong>Financial data:</strong> bank account details for settlements.</li>
          <li><strong>Operational data:</strong> menu items, business hours, order history, performance metrics.</li>
          <li><strong>Device data:</strong> device type, OS, app usage.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-usage",
    title: "3. How We Use Your Data",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>To list your restaurant on the Chatori Jeeb user app.</li>
        <li>To process customer orders and facilitate deliveries.</li>
        <li>To calculate settlements and transfer payouts.</li>
        <li>To provide analytics and performance insights.</li>
        <li>To communicate service updates and promotions.</li>
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
          <li>Customers — restaurant details, menu, and availability.</li>
          <li>Delivery Partners — location and pickup instructions.</li>
          <li>Financial & Compliance Partners — for tax and payout processing.</li>
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
          <li>Access the business and personal data we hold.</li>
          <li>Request correction of inaccurate information.</li>
          <li>Request to delist your restaurant.</li>
        </ul>
        <p>
          To exercise these rights, contact partner support or email{" "}
          <a href="mailto:partners@chatorijeeb.com" className="text-primary-deep font-semibold hover:underline">
            partners@chatorijeeb.com
          </a>.
        </p>
      </>
    ),
  },
];

export default function RestaurantPrivacy() {
  return (
    <LegalLayout
      title="Restaurant Partner Privacy Policy"
      description="Learn how Chatori Jeeb collects, uses, and protects data for our restaurant partners."
      lastUpdated="May 1, 2026"
      path="/restaurant-privacy"
      sections={sections}
    />
  );
}
