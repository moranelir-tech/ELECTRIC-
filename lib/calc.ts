import type { PlanType, Provider } from "./types";

/** איפה מתרכזת הצריכה של הלקוח (הערכה עצמית של המשתמש) */
export type Profile = "spread" | "day" | "night";

export const PROFILES: { value: Profile; label: string }[] = [
  { value: "spread", label: "מפוזרת לאורך היממה" },
  { value: "day", label: "בעיקר ביום (למשל עבודה מהבית)" },
  { value: "night", label: "בעיקר בלילה (למשל טעינת רכב חשמלי)" },
];

/**
 * חלק מהצריכה החודשית שנופל בתוך חלון ההנחה של המסלול, לפי פרופיל הצריכה.
 * ערכי "מפוזרת" מחושבים מהלוח: יום = 10 שעות מתוך 24, לילה = 8 שעות מתוך 24, ימים א'-ה' = 5 מתוך 7.
 * ערכי "בעיקר ביום/לילה" הם הנחות להמחשה בלבד ואינם נתון רשמי. אפשר לכוונן כאן.
 */
const DAYS = 5 / 7;
export const WINDOW_SHARE: Record<PlanType, Record<Profile, number>> = {
  flat_24_7: { spread: 1, day: 1, night: 1 },
  tiered: { spread: 1, day: 1, night: 1 },
  reward: { spread: 1, day: 1, night: 1 },
  weekdays_24h: { spread: DAYS, day: DAYS, night: DAYS },
  day: { spread: (10 / 24) * DAYS, day: 0.6, night: 0.1 },
  night: { spread: (8 / 24) * DAYS, day: 0.1, night: 0.6 },
};

export type Ineligible = "smart_meter" | "min_bill" | null;

export type Result = {
  provider: Provider;
  /** חיסכון חודשי (שמרני) ובטווח העליון, אם קיים */
  monthlyLow: number;
  monthlyHigh: number;
  yearlyLow: number;
  yearlyHigh: number;
  eligible: boolean;
  ineligibleReason: Ineligible;
};

function saving(p: Provider, bill: number, profile: Profile, pct: number): number {
  const raw = (bill * pct) / 100;
  if (p.planType === "reward") {
    return p.monthlyCap > 0 ? Math.min(raw, p.monthlyCap) : raw;
  }
  return raw * WINDOW_SHARE[p.planType][profile];
}

/**
 * הערכת חיסכון: ההנחה מוחלת על החשבון החודשי שהוזן, בהתאם לחלק הצריכה שנופל בחלון ההנחה.
 * בפועל ההנחה חלה על רכיב הצריכה בלבד, ולכן זו הערכה מקסימלית.
 */
export function calculate(
  providers: Provider[],
  monthlyBill: number,
  profile: Profile,
  hasSmartMeter: boolean,
): Result[] {
  const bill = Number.isFinite(monthlyBill) && monthlyBill > 0 ? monthlyBill : 0;
  return providers
    .map((provider) => {
      const monthlyLow = saving(provider, bill, profile, provider.discountPercent);
      const monthlyHigh = saving(provider, bill, profile, provider.discountMax ?? provider.discountPercent);
      let ineligibleReason: Ineligible = null;
      if (provider.requiresSmartMeter && !hasSmartMeter) ineligibleReason = "smart_meter";
      else if (bill < (provider.minMonthlyBill || 0)) ineligibleReason = "min_bill";
      return {
        provider,
        monthlyLow,
        monthlyHigh,
        yearlyLow: monthlyLow * 12,
        yearlyHigh: monthlyHigh * 12,
        eligible: ineligibleReason === null,
        ineligibleReason,
      };
    })
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      // מסלולי זיכוי (לא כסף) מוצגים אחרי מסלולי הנחה
      const ar = a.provider.planType === "reward";
      const br = b.provider.planType === "reward";
      if (ar !== br) return ar ? 1 : -1;
      return b.monthlyLow - a.monthlyLow;
    });
}

export function formatShekel(n: number): string {
  return `₪${Math.round(n).toLocaleString("he-IL")}`;
}

export function formatRange(low: number, high: number): string {
  return Math.round(low) === Math.round(high)
    ? formatShekel(low)
    : `${formatShekel(low)}-${formatShekel(high).replace("₪", "")}`;
}

export function formatDiscount(p: Provider): string {
  return p.discountMax && p.discountMax !== p.discountPercent
    ? `${p.discountPercent}%-${p.discountMax}%`
    : `${p.discountPercent}%`;
}
