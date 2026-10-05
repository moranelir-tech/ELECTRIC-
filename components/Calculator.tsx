"use client";

import { useMemo, useState } from "react";
import type { Provider } from "@/lib/types";
import { PROFILES, calculate, formatDiscount, formatRange, formatShekel, type Profile } from "@/lib/calc";
import LeadForm from "./LeadForm";

export default function Calculator({ providers }: { providers: Provider[] }) {
  const [bill, setBill] = useState<number>(400);
  const [profile, setProfile] = useState<Profile>("spread");
  const [smart, setSmart] = useState(true);
  const [leadFor, setLeadFor] = useState<Provider | null>(null);

  const results = useMemo(() => calculate(providers, bill, profile, smart), [providers, bill, profile, smart]);
  const best = results.find((r) => r.eligible);

  return (
    <section id="compare" aria-labelledby="calc-title">
      <div className="stage">
        <div className="stage-form">
          <h2 id="calc-title">כמה תחסכו על חשבון החשמל?</h2>
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
            <div className="field">
              <label htmlFor="profile">מתי אתם צורכים חשמל?</label>
              <select id="profile" className="input" value={profile} onChange={(e) => setProfile(e.target.value as Profile)}>
                {PROFILES.map((x) => (
                  <option key={x.value} value={x.value}>{x.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="check">
                <input type="checkbox" checked={smart} onChange={(e) => setSmart(e.target.checked)} /> יש לי מונה חכם
              </label>
            </div>
          </div>
        </div>
        <div className="result" aria-live="polite">
          {best && bill > 0 ? (
            <>
              <div className="who">המסלול המשתלם ביותר עבורכם: <strong>{best.provider.name}</strong>, {best.provider.plan}</div>
              <div className="big">{formatRange(best.monthlyLow, best.monthlyHigh)}<small>חיסכון בחודש</small></div>
              <div className="year">{formatRange(best.yearlyLow, best.yearlyHigh)} בשנה</div>
              <div className="acts">
                <button className="btn btn-amber" onClick={() => setLeadFor(best.provider)}>קבלת הצעת מחיר</button>
                {best.provider.affiliateUrl && (
                  <a className="btn btn-ghost" href={`/go/${best.provider.slug}`} target="_blank" rel="sponsored nofollow noopener">מעבר לספק</a>
                )}
              </div>
            </>
          ) : (
            <p className="hint">הזינו את החשבון החודשי כדי לראות כמה אפשר לחסוך.</p>
          )}
        </div>
      </div>

      <h2 className="list-title">כל המסלולים, מהחוסך ביותר</h2>
      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th>ספק ומסלול</th>
              <th>הנחה</th>
              <th>שעות</th>
                            <th>חיסכון חודשי</th>
              <th>חיסכון שנתי</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ provider: p, monthlyLow, monthlyHigh, yearlyLow, yearlyHigh, eligible, ineligibleReason }) => (
              <tr key={p.id} className={`${p.featured ? "featured" : ""} ${eligible ? "" : "ineligible"} ${best && p.id === best.provider.id && bill > 0 ? "best" : ""}`}>
                <td data-label="ספק">
                  <strong>{p.name}</strong>
                  {best && p.id === best.provider.id && bill > 0 && <span className="badge top">החיסכון הגבוה ביותר</span>}
                  {p.featured && <span className="badge">מומלץ</span>}
                  <div className="small">{p.plan}</div>
                  <div>
                    {p.requiresSmartMeter && <span className="badge">דורש מונה חכם</span>}
                    {p.bundleRequired && <span className="badge">מותנה בלקוח קיים</span>}
                    {p.planType === "reward" && <span className="badge">זיכוי ולא החזר כספי</span>}
                  </div>
                  {ineligibleReason === "smart_meter" && <div className="small">לא זמין ללא מונה חכם</div>}
                  {ineligibleReason === "min_bill" && <div className="small">נדרש חשבון מינימלי של {formatShekel(p.minMonthlyBill)}</div>}
                  {p.officialUrl && (
                    <a className="small" href={p.officialUrl} target="_blank" rel="nofollow noopener">לאתר הספק</a>
                  )}
                </td>
                <td data-label="הנחה"><strong><bdi dir="ltr">{formatDiscount(p)}</bdi></strong>{p.monthlyCap > 0 && <div className="small">עד {formatShekel(p.monthlyCap)} בחודש</div>}</td>
                <td data-label="שעות">{p.hours || "-"}</td>
                <td data-label="חיסכון חודשי"><span className="save">{formatRange(monthlyLow, monthlyHigh)}</span></td>
                <td data-label="חיסכון שנתי"><span className="save">{formatRange(yearlyLow, yearlyHigh)}</span></td>
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
        בלבד: ההנחה חלה על רכיב הצריכה ובשעות המסלול בלבד, והחישוב מבוסס על פרופיל הצריכה שבחרתם. יש לאמת את התנאים מול הספק לפני המעבר.
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
