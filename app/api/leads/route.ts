import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addLead, getActiveProviders } from "@/lib/store";
import type { Lead } from "@/lib/types";

// הגבלת קצב בסיסית בזיכרון: עד 5 לידים לשעה לכל IP
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("972") ? "0" + digits.slice(3) : digits;
  return /^0\d{8,9}$/.test(local) ? local : null;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  if (limited(ip)) {
    return NextResponse.json({ error: "יותר מדי פניות. נסו שוב מאוחר יותר." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  // שדה פיתיון נגד בוטים: אם מולא, מחזירים הצלחה בלי לשמור
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 150);
  const phone = normalizePhone(String(body.phone || ""));
  const consent = body.consent === true;

  if (name.length < 2) return NextResponse.json({ error: "נא להזין שם" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "מספר טלפון לא תקין" }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "כתובת אימייל לא תקינה" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: "יש לאשר את תנאי השימוש ומדיניות הפרטיות" }, { status: 400 });
  }

  const bill = Number(body.monthlyBill);
  let providerSlug: string | null = null;
  if (typeof body.providerSlug === "string" && body.providerSlug) {
    const providers = await getActiveProviders();
    providerSlug = providers.find((p) => p.slug === body.providerSlug)?.slug ?? null;
  }

  const lead: Lead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    phone,
    email,
    monthlyBill: Number.isFinite(bill) && bill > 0 ? Math.round(bill) : null,
    providerSlug,
    consent: true,
    source: String(body.source || "site").slice(0, 50),
  };

  await addLead(lead);

  const hook = process.env.LEADS_WEBHOOK_URL;
  if (hook) {
    // לא חוסמים את התשובה ללקוח אם ה-webhook איטי או נכשל
    fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(5000),
    }).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
