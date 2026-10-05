import { NextResponse } from "next/server";
import { registerClick } from "@/lib/store";

// מעבר ישיר לספק דרך קישור שותפים, עם ספירת הקלקות
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const provider = await registerClick(slug);
  const target = provider?.affiliateUrl;

  if (!target || !/^https?:\/\//i.test(target)) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  const res = NextResponse.redirect(target, 302);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
