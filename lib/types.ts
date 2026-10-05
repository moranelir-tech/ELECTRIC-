export type Provider = {
  id: string;
  slug: string;
  name: string;
  plan: string;
  /** אחוז הנחה מהתעריף (0-100) */
  discountPercent: number;
  /** שעות ההנחה, למשל "כל שעות היממה" */
  hours: string;
  /** צריכה חודשית מינימלית בשקלים (0 = ללא) */
  minMonthlyBill: number;
  /** תקופת התחייבות, למשל "ללא התחייבות" */
  commitment: string;
  notes: string;
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
