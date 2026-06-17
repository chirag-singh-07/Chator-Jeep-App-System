import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <div className="space-y-4">
        <p>
          Chatori Jeeb Delivery ("we", "us", or "our") respects your privacy and is committed to protecting the personal data of our Delivery Partners. This Privacy Policy outlines our practices regarding the collection, use, processing, and sharing of your information when you use the Chatori Jeeb Delivery App (the "App") and our related services.
        </p>
        <p>
          By joining our network as a Delivery Partner, you consent to the data practices described in this policy. If you do not agree with these practices, please do not use the App or provide us with your personal information.
        </p>
      </div>
    ),
  },
  {
    id: "data-collection",
    title: "2. Data We Collect",
    content: (
      <div className="space-y-4">
        <p>We collect various types of information to ensure a safe, efficient, and reliable delivery experience. This includes:</p>
        <div className="pl-4 border-l-2 border-primary/30 space-y-4">
          <div>
            <h3 className="font-semibold text-lg">A. Account & Identity Data</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Personal details:</strong> Full name, date of birth, gender, and profile photo.</li>
              <li><strong>Contact information:</strong> Mobile phone number, email address, and residential address.</li>
              <li><strong>Verification documents:</strong> Government-issued ID (e.g., Aadhar, PAN), driving license, vehicle registration, and insurance documents.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">B. Location & Tracking Data</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Precise Location:</strong> Real-time GPS data tracking when you are online, during active orders, and background location tracking to assign nearby orders and provide navigation.</li>
              <li><strong>Route Information:</strong> Historical route data to improve estimated delivery times.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">C. Financial Data</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Bank Details:</strong> Bank account number, IFSC code, and beneficiary name for processing your earnings.</li>
              <li><strong>Earnings History:</strong> Records of your completed deliveries, incentives, tips, and overall payouts.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">D. Device & Usage Data</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Device Specs:</strong> IP address, device type, operating system version, unique device identifiers, and mobile network info.</li>
              <li><strong>App Analytics:</strong> How you interact with the App, timestamps, crash reports, and performance metrics.</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "data-usage",
    title: "3. How We Use Your Data",
    content: (
      <div className="space-y-4">
        <p>Your data is crucial for the operation of the Chatori Jeeb platform. We use it for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Service Delivery:</strong> To create your account, verify your identity, assign delivery requests efficiently based on proximity, and provide turn-by-turn navigation.</li>
          <li><strong>Financial Processing:</strong> To accurately calculate your earnings, bonuses, tips, and facilitate weekly or daily bank transfers.</li>
          <li><strong>Safety & Security:</strong> To conduct background checks, monitor for fraudulent activity, investigate incidents, and maintain the overall safety of our ecosystem.</li>
          <li><strong>Communication:</strong> To send you essential updates about the App, policy changes, promotional offers, and support responses.</li>
          <li><strong>Platform Improvement:</strong> To analyze performance metrics, troubleshoot technical issues, and optimize our routing algorithms.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "third-party",
    title: "4. Third-Party Sharing",
    content: (
      <div className="space-y-4">
        <p>We may share your data with selected third parties to provide and improve our services:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Customers & Restaurants:</strong> We share your first name, profile picture, vehicle details, and live location with customers and restaurants to facilitate order tracking and pickup/drop-off.</li>
          <li><strong>Service Providers:</strong> Background check agencies, cloud hosting providers, mapping and navigation services (e.g., Google Maps), and customer support software.</li>
          <li><strong>Financial Partners:</strong> Payment gateways and banks to process your payouts and manage financial records.</li>
          <li><strong>Legal & Regulatory Authorities:</strong> We may disclose data when required by law, court order, or to protect the rights, property, or safety of Chatori Jeeb, our users, or the public.</li>
        </ul>
        <p className="text-sm text-muted-foreground italic">Note: We do not sell your personal data to advertisers or data brokers.</p>
      </div>
    ),
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: (
      <p>
        We retain your personal information for as long as your account is active or as needed to provide you services. Even after account closure, we may retain certain data to comply with our legal obligations (such as tax and accounting laws), resolve disputes, prevent fraud, and enforce our agreements. Typically, financial records are kept for up to 7 years.
      </p>
    ),
  },
  {
    id: "security",
    title: "6. Data Security",
    content: (
      <p>
        We implement robust technical and organizational measures to protect your data against unauthorized access, loss, or alteration. This includes encryption (SSL/TLS), secure servers, and strict access controls. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "7. Your Rights & Choices",
    content: (
      <div className="space-y-4">
        <p>As a Delivery Partner, you have the following rights regarding your personal data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Access & Portability:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Correction:</strong> Update or correct inaccurate information through the App or by contacting support.</li>
          <li><strong>Deletion:</strong> Request the deletion of your account and associated data, subject to legal retention requirements.</li>
          <li><strong>Location Permissions:</strong> You can disable location tracking through your device settings, but this will prevent you from receiving delivery orders.</li>
        </ul>
        <p>
          To exercise these rights, please contact our Data Protection Officer at{" "}
          <a href="mailto:privacy@chatorijeeb.com" className="text-primary-deep font-semibold hover:underline">
            privacy@chatorijeeb.com
          </a>.
        </p>
      </div>
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
