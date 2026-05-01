import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p>
          By accessing or using Chatori Jeeb (the "Service"), you agree to be bound by these Terms &
          Conditions. If you do not agree, please do not use the Service.
        </p>
        <p>
          We may update these terms from time to time. Continued use of the Service after changes
          constitutes acceptance of the revised terms.
        </p>
      </>
    ),
  },
  {
    id: "user-responsibilities",
    title: "2. User Responsibilities",
    content: (
      <>
        <p>As a user of Chatori Jeeb, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide accurate, current, and complete information during registration.</li>
          <li>Keep your account credentials secure and confidential.</li>
          <li>Use the Service only for lawful purposes.</li>
          <li>Not impersonate others or misrepresent your affiliation.</li>
          <li>Pay all charges associated with your orders on time.</li>
        </ul>
      </>
    ),
  },
  {
    id: "delivery-partner",
    title: "3. Delivery Partner Terms",
    content: (
      <>
        <p>
          Delivery partners operate as independent contractors. By signing up as a delivery partner,
          you agree to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Maintain a valid driving license and required vehicle documents.</li>
          <li>Complete deliveries safely, professionally, and within stated timelines.</li>
          <li>Handle food orders with hygiene and care.</li>
          <li>Accept that earnings depend on completed orders, performance, and incentives.</li>
        </ul>
      </>
    ),
  },
  {
    id: "restaurant-partner",
    title: "4. Restaurant Partner Terms",
    content: (
      <>
        <p>Restaurants partnering with Chatori Jeeb agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Maintain valid FSSAI and applicable local food licenses.</li>
          <li>Honour menu prices and item availability listed on the platform.</li>
          <li>Prepare orders within agreed preparation times.</li>
          <li>Accept Chatori Jeeb's commission structure as detailed in the partner agreement.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payments",
    title: "5. Payments & Refunds",
    content: (
      <>
        <p>
          All payments are processed through secure third-party gateways. Refunds for cancelled or
          incorrect orders are issued to the original payment method within 5–7 business days,
          subject to verification.
        </p>
        <p>
          Promotional credits and coupons are non-transferable and have no cash value.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "6. Limitation of Liability",
    content: (
      <>
        <p>
          Chatori Jeeb provides the Service on an "as is" basis. To the maximum extent permitted by
          law, we are not liable for indirect, incidental, or consequential damages arising from your
          use of the Service.
        </p>
        <p>
          Food quality and preparation remain the responsibility of the partner restaurant.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "7. Termination",
    content: (
      <p>
        We reserve the right to suspend or terminate accounts that violate these terms, engage in
        fraudulent activity, or harm other users or partners.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "8. Governing Law",
    content: (
      <p>
        These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive
        jurisdiction of the courts of Bengaluru, Karnataka.
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      description="Read the Chatori Jeeb Terms & Conditions covering user responsibilities, delivery and restaurant partner terms, payments, and liability."
      lastUpdated="May 1, 2026"
      path="/terms"
      sections={sections}
    />
  );
}