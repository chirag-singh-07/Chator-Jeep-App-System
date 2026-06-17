import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <div className="space-y-4">
        <p>
          Chatori Jeeb Restaurant ("we", "us", or "our") values our partnership with you. This Privacy Policy explains how we collect, process, use, and protect the data of our Restaurant Partners when they use our merchant platform and services.
        </p>
        <p>
          By onboarding your restaurant onto the Chatori Jeeb platform, you consent to the data practices described in this policy.
        </p>
      </div>
    ),
  },
  {
    id: "data-collection",
    title: "2. Data We Collect",
    content: (
      <div className="space-y-4">
        <p>To provide a seamless ordering experience for our mutual customers, we collect the following types of information from our Restaurant Partners:</p>
        <div className="pl-4 border-l-2 border-primary/30 space-y-4">
          <div>
            <h3 className="font-semibold text-lg">A. Business & Registration Data</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Restaurant details:</strong> Restaurant name, primary and secondary addresses, geolocation coordinates, and business type.</li>
              <li><strong>Owner/Manager details:</strong> Full name, contact number, and email address of authorized representatives.</li>
              <li><strong>Compliance documents:</strong> FSSAI license, GST registration, PAN details, and other regulatory licenses.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">B. Operational & Menu Data</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Catalog:</strong> Menu items, descriptions, prices, food categories (veg/non-veg), preparation times, and food images.</li>
              <li><strong>Store operations:</strong> Operating hours, active/inactive status, and serviceability radius.</li>
              <li><strong>Performance metrics:</strong> Order acceptance rates, preparation delays, cancellation rates, and customer ratings/reviews.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">C. Financial Data</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Settlement details:</strong> Bank account numbers, IFSC codes, and beneficiary names for transferring payouts.</li>
              <li><strong>Transaction records:</strong> Details of orders processed, commissions deducted, taxes collected, and payout history.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">D. Device & System Data</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Merchant App/Web usage:</strong> IP addresses, browser types, device IDs, login timestamps, and interaction data on the merchant dashboard.</li>
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
        <p>We process your data to operate the platform efficiently and drive business to your restaurant:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Platform Listing:</strong> To display your restaurant, menu, and operating hours to customers on the Chatori Jeeb user app.</li>
          <li><strong>Order Fulfillment:</strong> To transmit customer orders to your dashboard and coordinate with delivery partners for pickup.</li>
          <li><strong>Financial Settlements:</strong> To calculate net payouts (after commissions and taxes) and facilitate secure bank transfers.</li>
          <li><strong>Analytics & Growth:</strong> To provide you with business insights, sales trends, and personalized recommendations to increase your revenue.</li>
          <li><strong>Support & Compliance:</strong> To assist you with operational queries, manage disputes, and ensure adherence to food safety and regulatory standards.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "third-party",
    title: "4. Third-Party Sharing",
    content: (
      <div className="space-y-4">
        <p>We may share your business data with the following entities:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Customers:</strong> Publicly available information such as your restaurant name, location, menu, prices, and customer reviews.</li>
          <li><strong>Delivery Partners:</strong> Restaurant address, contact number (often masked), and specific pickup instructions to ensure smooth order collection.</li>
          <li><strong>Service Providers:</strong> Cloud storage providers, data analytics platforms, and customer support software that help us maintain our services.</li>
          <li><strong>Financial & Regulatory Bodies:</strong> Payment gateways for processing transactions, and government authorities for tax reporting and compliance audits.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: (
      <p>
        We retain your restaurant's data for the duration of your active partnership with us. Upon termination or delisting, we may retain certain business and financial records for a period of up to 8 years, or as mandated by local tax and corporate laws.
      </p>
    ),
  },
  {
    id: "security",
    title: "6. Data Security",
    content: (
      <p>
        Protecting your business data is our priority. We employ industry-standard security protocols, including encrypted communications, secure data centers, and restricted access controls, to safeguard your sensitive business and financial information.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "7. Your Rights & Choices",
    content: (
      <div className="space-y-4">
        <p>As a Restaurant Partner, you have control over your data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Information Access:</strong> View your operational and financial data directly through the merchant dashboard.</li>
          <li><strong>Data Correction:</strong> Update menu items, prices, operating hours, and contact details via the app or by raising a support ticket.</li>
          <li><strong>Delisting:</strong> Request temporary deactivation or permanent removal of your restaurant from the platform.</li>
          <li><strong>Data Export:</strong> Request a summary report of your historical sales and payouts.</li>
        </ul>
        <p>
          For privacy-related inquiries or to exercise your rights, please reach out to your dedicated account manager or email{" "}
          <a href="mailto:partners@chatorijeeb.com" className="text-primary-deep font-semibold hover:underline">
            partners@chatorijeeb.com
          </a>.
        </p>
      </div>
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
