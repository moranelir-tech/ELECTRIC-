import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | השוואת ספקי חשמל ומחשבון חיסכון`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "משווים בין ספקי חשמל בישראל, מחשבים כמה אפשר לחסוך בחשבון החשמל ועוברים לספק המתאים בקלות.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | השוואת ספקי חשמל`,
    description: "מחשבון חיסכון והשוואה בין ספקי חשמל בישראל.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b6bcb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "he-IL",
  };

  return (
    <html lang="he" dir="rtl">
      <body>
        <header className="header">
          <div className="container">
            <Link href="/" className="logo">
              השוואת <span>חשמל</span>
            </Link>
            <nav className="nav" aria-label="ניווט ראשי">
              <Link href="/#compare">השוואה</Link>
              <Link href="/blog">בלוג</Link>
              <Link href="/faq">שאלות נפוצות</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            <span>© {new Date().getFullYear()} {SITE_NAME}</span>
            <span>
              <Link href="/privacy">מדיניות פרטיות</Link>
            </span>
          </div>
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
