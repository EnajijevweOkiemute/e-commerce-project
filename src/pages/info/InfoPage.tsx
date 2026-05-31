import { Link, useLocation } from "react-router-dom";
import "./infoPage.css";

type InfoPageConfig = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: {
    title: string;
    body: string[];
  }[];
  cta?: {
    label: string;
    to: string;
  };
};

const pages: Record<string, InfoPageConfig> = {
  "about-us": {
    eyebrow: "About Kyklos",
    title: "A quieter way to shop refined essentials.",
    intro:
      "Kyklos curates watches, bags, and accessories for customers who value lasting materials, clean design, and dependable service.",
    sections: [
      {
        title: "Our Standard",
        body: [
          "Every product in the collection is selected for quality, usability, and long-term appeal.",
          "We focus on pieces that fit everyday routines without losing the polish expected from a premium store.",
        ],
      },
      {
        title: "How We Serve",
        body: [
          "Customers can browse, order, track deliveries, and review payment activity from one account.",
          "Our support approach is direct: clear product information, transparent policies, and responsive help when it is needed.",
        ],
      },
    ],
  },
  "terms-of-service": {
    eyebrow: "Terms",
    title: "Terms of Service",
    intro:
      "These terms explain the basic rules for using Kyklos, placing orders, and managing your account.",
    sections: [
      {
        title: "Using the Store",
        body: [
          "You agree to provide accurate account, delivery, and payment information when using checkout.",
          "You are responsible for keeping your login credentials secure and for activity under your account.",
        ],
      },
      {
        title: "Orders and Payments",
        body: [
          "Orders are created after payment is confirmed by the payment provider.",
          "Prices, stock, and product availability may change, but confirmed orders keep the details shown at checkout.",
        ],
      },
      {
        title: "Limitations",
        body: [
          "Kyklos is not responsible for delays caused by incorrect delivery details, payment provider outages, or events outside normal control.",
          "If a term cannot be enforced, the remaining terms still apply.",
        ],
      },
    ],
  },
  "privacy-policy": {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    intro:
      "This policy describes the information Kyklos uses to operate accounts, orders, payment records, and customer support.",
    sections: [
      {
        title: "Information We Use",
        body: [
          "We use account details such as name and email to identify customers and manage order history.",
          "Checkout details such as delivery address and transaction references are used to process payments, track orders, and generate receipts.",
        ],
      },
      {
        title: "How Information Is Protected",
        body: [
          "Payment processing is handled through the configured payment provider, and full card details are not stored in this app.",
          "Local browser storage is used in this project to preserve cart, order, notification, and transaction history for the signed-in user.",
        ],
      },
      {
        title: "Your Choices",
        body: [
          "You can sign out to clear the active session from the device.",
          "For account or order questions, contact support with the relevant order or transaction reference.",
        ],
      },
    ],
  },
  "contact-us": {
    eyebrow: "Support",
    title: "Contact Us",
    intro:
      "Reach the Kyklos team for help with orders, payments, product questions, or account access.",
    sections: [
      {
        title: "Customer Support",
        body: [
          "Email: support@kyklos.example",
          "Hours: Monday to Friday, 9:00 AM to 6:00 PM",
          "For faster help, include your order ID or payment reference when contacting us.",
        ],
      },
      {
        title: "Order and Payment Help",
        body: [
          "Customers can review orders from the Orders page and payment attempts from Transaction History.",
          "If a payment failed, repeat the transaction from your transaction details page after confirming the checkout information.",
        ],
      },
    ],
  
  },
  faq: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    intro:
      "Answers to common questions about orders, payments, delivery tracking, and transaction receipts.",
    sections: [
      {
        title: "How do I track an order?",
        body: [
          "Open your dashboard and select Orders. Each order shows the delivery tracker and the latest status.",
        ],
      },
      {
        title: "Where can I see failed payments?",
        body: [
          "Open Transaction History from your dashboard. It includes both successful and failed payment attempts.",
        ],
      },
      {
        title: "Can I repeat a previous transaction?",
        body: [
          "Yes. Open a transaction, choose Repeat Transaction, and checkout will be populated with the original items and customer details.",
        ],
      },
      {
        title: "How do I download a receipt?",
        body: [
          "Open Transaction History, select a transaction, then choose Download Receipt from the transaction details.",
        ],
      },
    ],
  },
};

export function InfoPage() {
  const location = useLocation();
  const page = location.pathname.replace("/", "") || "about-us";
  const content = pages[page] ?? pages["about-us"];

  return (
    <section className="info-section">
      <div className="info-hero">
        {/* <span className="info-eyebrow">{content.eyebrow}</span> */}
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        {content.cta && (
          <Link className="info-cta" to={content.cta.to}>
            {content.cta.label}
          </Link>
        )}
      </div>

      <div className="info-content">
        {content.sections.map((section) => (
          <article className="info-block" key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
