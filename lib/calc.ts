import type { Provider } from "./types";

export type Result = {
  provider: Provider;
  monthlySaving: number;
  yearlySaving: number;
  newMonthlyBill: number;
  eligible: boolean;
};

/**
 * חישוב חיסכון: ההנחה (באחוזים) מוחלת על החשבון החודשי שהמשתמש הזין.
 * זוהי הערכה בלבד - החיסכון בפועל תלוי בשעות הצריכה ובתנאי הספק.
 */
export function calculate(providers: Provider[], monthlyBill: number): Result[] {
  const bill = Number.isFinite(monthlyBill) && monthlyBill > 0 ? monthlyBill : 0;
  return providers
    .map((provider) => {
      const monthlySaving = (bill * provider.discountPercent) / 100;
      return {
        provider,
        monthlySaving,
        yearlySaving: monthlySaving * 12,
        newMonthlyBill: bill - monthlySaving,
        eligible: bill >= (provider.minMonthlyBill || 0),
      };
    })
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return b.monthlySaving - a.monthlySaving;
    });
}

export function formatShekel(n: number): string {
  return `₪${Math.round(n).toLocaleString("he-IL")}`;
}
