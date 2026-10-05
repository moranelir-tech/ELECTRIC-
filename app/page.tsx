import Calculator from "@/components/Calculator";
import LeadForm from "@/components/LeadForm";
import { getActiveProviders } from "@/lib/store";
import { FAQ, SITE_URL } from "@/lib/content";

export default async function Home() {
  const providers = await getActiveProviders();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "השוואת ספקי חשמל",
    url: SITE_URL,
    itemListElement: providers.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${p.name} - ${p.plan}`,
    })),
  };

  return (
    <>
      <div className="container">
        <section className="hero">
          <h1>משווים ספקי חשמל ומורידים את החשבון</h1>
          <p>
            מזינים את החשבון החודשי, רואים כמה אפשר לחסוך אצל כל ספק, ועוברים בכמה קליקים.
          </p>
        </section>

        <Calculator providers={providers} />

        <section className="section" aria-labelledby="lead-title">
          <div className="card" style={{ maxWidth: 520, marginInline: "auto" }}>
            <h2 id="lead-title">רוצה שנציג יחזור אליך עם הצעה מותאמת אישית?</h2>
            <p className="small">משאירים פרטים ונחזור עם המסלול המשתלם ביותר עבורכם.</p>
            <LeadForm source="home-form" />
          </div>
        </section>

        <section className="section faq" aria-labelledby="faq-title">
          <h2 id="faq-title">שאלות נפוצות</h2>
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
    </>
  );
}
