export type PlanType = "day" | "night" | "flat_24_7" | "weekdays_24h" | "tiered" | "reward";

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  day: "יום (שעות עבודה)",
  night: "לילה",
  flat_24_7: "קבוע 24/7 כל השבוע",
  weekdays_24h: "קבוע 24 שעות, ימי חול",
  tiered: "הנחה מדורגת",
  reward: "זיכוי (לא החזר כספי)",
};

export type Provider = {
  id: string;
  slug: string;
  name: string;
  plan: string;
  planType: PlanType;
  /** אחוז הנחה (0-100). בטווח מציינים כאן את הגבול התחתון, והחישוב שמרני */
  discountPercent: number;
  /** גבול עליון של טווח הנחה (אם יש), אחרת null */
  discountMax: number | null;
  /** תיאור חופשי של ימים ושעות, למשל "א'-ה', 07:00-17:00" */
  hours: string;
  requiresSmartMeter: boolean;
  /** מסלול מותנה בלקוח קיים או בחבילה נוספת של הספק */
  bundleRequired: boolean;
  /** תקרת זיכוי חודשית בשקלים (למסלולי זיכוי). 0 = ללא תקרה */
  monthlyCap: number;
  /** צריכה חודשית מינימלית בשקלים (0 = ללא) */
  minMonthlyBill: number;
  commitment: string;
  notes: string;
  officialUrl: string;
  /** קישור שותפים (Affiliate) - מעבר ישיר לאתר הספק */
  affiliateUrl: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  clicks: number;
};

export type Lead = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  monthlyBill: number | null;
  providerSlug: string | null;
  consent: boolean;
  source: string;
};
