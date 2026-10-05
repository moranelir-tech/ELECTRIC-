import type { Metadata } from "next";
import { FAQ } from "@/lib/content";

export const metadata: Metadata = {
  title: "שאלות נפוצות על מעבר לספק חשמל",
  description: "תשובות לשאלות נפוצות על מעבר לספק חשמל פרטי: איך זה עובד, כמה אפשר לחסוך והאם יש התחייבות.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="container section faq">
      <h1>שאלות נפוצות</h1>
      {FAQ.map((f) => (
        <details key={f.q} open>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
