import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getLeads } from "@/lib/store";

function cell(v: unknown): string {
  let s = String(v ?? "");
  // מניעת הזרקת נוסחאות (CSV injection) כשהקובץ נפתח באקסל
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

// ייצוא ל-CSV עם BOM, כך שאקסל מציג עברית נכון
export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const leads = await getLeads();
  const header = ["תאריך", "שם", "טלפון", "אימייל", "חשבון חודשי", "ספק", "מקור"];
  const rows = leads.map((l) =>
    [
      new Date(l.createdAt).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }),
      l.name,
      l.phone,
      l.email,
      l.monthlyBill ?? "",
      l.providerSlug ?? "",
      l.source,
    ]
      .map(cell)
      .join(","),
  );
  const csv = "﻿" + [header.map(cell).join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
