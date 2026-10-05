import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getProviders, saveProviders } from "@/lib/store";
import type { Provider } from "@/lib/types";

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getProviders());
}

function clean(raw: unknown, index: number): Provider | string {
  const p = raw as Record<string, unknown>;
  const name = String(p.name || "").trim();
  const slug = String(p.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!name) return `שורה ${index + 1}: חסר שם ספק`;
  if (!slug) return `שורה ${index + 1}: חסר מזהה (slug) באנגלית`;

  const discount = Number(p.discountPercent);
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    return `שורה ${index + 1}: אחוז ההנחה חייב להיות בין 0 ל-100`;
  }

  const url = String(p.affiliateUrl || "").trim();
  if (url && !/^https?:\/\//i.test(url)) {
    return `שורה ${index + 1}: קישור שותפים חייב להתחיל ב-http:// או https://`;
  }

  return {
    id: String(p.id || `${slug}-${Date.now()}-${index}`),
    slug,
    name,
    plan: String(p.plan || "").trim(),
    discountPercent: discount,
    hours: String(p.hours || "").trim(),
    minMonthlyBill: Math.max(0, Number(p.minMonthlyBill) || 0),
    commitment: String(p.commitment || "").trim(),
    notes: String(p.notes || "").trim(),
    affiliateUrl: url,
    featured: p.featured === true,
    active: p.active !== false,
    sortOrder: Number.isFinite(Number(p.sortOrder)) ? Number(p.sortOrder) : index + 1,
    clicks: Math.max(0, Number(p.clicks) || 0),
  };
}

// שמירת כל טבלת הספקים בבת אחת
export async function PUT(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) return NextResponse.json({ error: "פורמט לא תקין" }, { status: 400 });

  const out: Provider[] = [];
  const slugs = new Set<string>();
  for (let i = 0; i < body.length; i++) {
    const r = clean(body[i], i);
    if (typeof r === "string") return NextResponse.json({ error: r }, { status: 400 });
    if (slugs.has(r.slug)) {
      return NextResponse.json({ error: `המזהה "${r.slug}" מופיע יותר מפעם אחת` }, { status: 400 });
    }
    slugs.add(r.slug);
    out.push(r);
  }

  await saveProviders(out);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true, count: out.length });
}
