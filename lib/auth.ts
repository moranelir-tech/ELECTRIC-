import { createHmac, timingSafeEqual } from "crypto";

export const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 שעות

function secret(): string {
  return process.env.SESSION_SECRET || "dev-only-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // בלי סיסמה מוגדרת - אין כניסה
  return safeEqual(input, expected);
}

export function createSessionToken(): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, sign(payload))) return false;
  return Number(payload) > Date.now();
}

export function isAdmin(req: Request): boolean {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.split(/;\s*/).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  return verifySessionToken(match?.slice(COOKIE_NAME.length + 1));
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
