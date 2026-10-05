import type { MetadataRoute } from "next";
import { INDEXING, SITE_URL } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING) {
    // שלב בנייה: חוסמים סריקה של כל האתר
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/go/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
