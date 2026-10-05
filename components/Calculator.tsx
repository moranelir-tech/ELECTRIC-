"use client";

import { useMemo, useState } from "react";
import type { Provider } from "@/lib/types";
import { calculate, formatShekel } from "@/lib/calc";
import LeadForm from "./LeadForm";

export default function Calculator({ providers }: { providers: Provider[] }) {
  const [bill, setBill] = useState<number>(400);
  const [leadFor, setLeadFor] = useState<Provider | null>(null);

  const results = useMemo(() => calculate(providers, bill), [providers, bill]);
  const best = results.find((r) => r.eligible);

  return (
    <section id="compare" aria-labelledby="calc-title">
      <div className="card">
        <h2 id="calc-title" style={{ textAlign: "center" }}>כמה תחסכו על חשבון החשמל?</h2>
        <div className="calc">
          <div className="field">
            <label htmlFor="bill">חשבון חשמל חודשי (₪)</label>
            <input
              id="bill"
              className="input"
              type="number"
              inputMode="numeric"
              min={0}
              step={10}
              value={Number.isFinite(bill) ? bill : ""}
              onChange={(e) => setBill(e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </div>
        </div>
        {best && bill > 0 && (
          <p className="summary" aria-live="polite">
            החיסכון המשוער עם <strong>{best.provider.name}</strong>:{" "}
            <strong>{formatShekel(best.monthlySaving)}</strong> בחודש,{" "}
            <strong>{formatShekel(best.yearlySaving)}</strong> בשנה
          </p>
        )}
      </div>

      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th>ספק ומסלול</th>
              <th>הנחה</th>
              <th>שעות</th>
              <th>התחייבות</th>
              <th>חיסכון חודשי</th>
              <th>חיסכון שנתי</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ provider: p, monthlySaving, yearlySaving, eligible }) => (
              <tr key={p.id} className={`${p.featured ? "featured" : ""} ${eligible ? "" : "ineligible"}`}>
                <td data-label="ספק">
                  <strong>{p.name}</strong>
                  {p.featured && <span className="badge">מומלץ</span>}
                  <div className="small">{p.plan}</div>
                  {!eligible && <div className="small">נדרש חשבון מינימלי של {formatShekel(p.minMonthlyBill)}</div>}
                </td>
                <td data-label="הנחה"><strong>{p.discountPercent}%</strong></td>
                <td data-label="שעות">{p.hours || "-"}</td>
                <td data-label="התחייבות">{p.commitment || "-"}</td>
                <td data-label="חיסכון חודשי"><span className="save">{formatShekel(monthlySaving)}</span></td>
                <td data-label="חיסכון שנתי"><span className="save">{formatShekel(yearlySaving)}</span></td>
                <td className="cta-cell">
                  <div className="cta">
                    {p.affiliateUrl && (
                      <a
                        className="btn btn-primary"
                        href={`/go/${p.slug}`}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                      >
                        מעבר מהיר לספק
                      </a>
                    )}
                    <button className="btn btn-ghost" onClick={() => setLeadFor(p)}>
                      קבלת הצעת מחיר
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="disclosure">
        גילוי נאות: האתר עשוי לקבל עמלה מספקים כשעוברים אליהם דרכו, ללא עלות נוספת עבורכם. החיסכון המוצג הוא הערכה
        בלבד, ותלוי בשעות הצריכה ובתנאי המסלול. יש לאמת את התנאים מול הספק לפני המעבר.
      </p>

      {leadFor && (
        <div className="modal-back" role="dialog" aria-modal="true" aria-label="השארת פרטים" onClick={() => setLeadFor(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>רוצים שנציג יחזור אליכם?</h3>
                <p className="small">הצעה מותאמת אישית: {leadFor.name} - {leadFor.plan}</p>
              </div>
              <button className="x" aria-label="סגירה" onClick={() => setLeadFor(null)}>×</button>
            </div>
            <LeadForm providerSlug={leadFor.slug} monthlyBill={bill} source="table-cta" />
          </div>
        </div>
      )}
    </section>
  );
}
