import { NextResponse } from "next/server";
import { COOKIE_NAME, SESSION_MAX_AGE, checkPassword, createSessionToken } from "@/lib/auth";

const attempts = new Map<string, { count: number; first: number }>();

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && now - a.first < 15 * 60 * 1000 && a.count >= 10) {
    return NextResponse.json({ error: "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD לא הוגדר בשרת" }, { status: 500 });
  }
  if (!checkPassword(String(body.password || ""))) {
    const cur = a && now - a.first < 15 * 60 * 1000 ? a : { count: 0, first: now };
    cur.count += 1;
    attempts.set(ip, cur);
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
