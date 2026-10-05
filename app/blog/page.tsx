import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "בלוג: מדריכים על חשמל וחיסכון",
  description: "מדריכים קצרים על בחירת ספק חשמל, הבנת התעריפים וחיסכון בחשבון החשמל.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <div className="container section">
      <h1>בלוג</h1>
      <div className="post-list">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`}>
            <article className="card">
              <h2>{p.title}</h2>
              <p className="small">{p.description}</p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
