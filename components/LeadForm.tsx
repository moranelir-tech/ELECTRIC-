"use client";

import { useState } from "react";

type Props = {
  providerSlug?: string | null;
  monthlyBill?: number | null;
  source: string;
  submitLabel?: string;
};

export default function LeadForm({ providerSlug, monthlyBill, source, submitLabel = "שלחו לי הצעה" }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          website: form.get("website"),
          consent: form.get("consent") === "on",
          providerSlug: providerSlug || null,
          monthlyBill: monthlyBill || null,
          source,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "אירעה שגיאה. נסו שוב.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("אירעה שגיאת תקשורת. נסו שוב.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return <p className="msg-ok">תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם.</p>;
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <input className="input" name="name" placeholder="שם מלא" autoComplete="name" required aria-label="שם מלא" />
      <input
        className="input"
        name="phone"
        type="tel"
        inputMode="tel"
        placeholder="טלפון"
        autoComplete="tel"
        required
        aria-label="טלפון"
      />
      <input
        className="input"
        name="email"
        type="email"
        placeholder="אימייל (לא חובה)"
        autoComplete="email"
        aria-label="אימייל"
      />
      {/* שדה פיתיון נגד בוטים - אנשים לא רואים אותו */}
      <div className="hp" aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="check">
        <input type="checkbox" name="consent" required />
        <span>
          אני מאשר/ת שהפרטים יועברו לספקי חשמל לצורך הצעה מותאמת, ומסכים/ה ל
          <a href="/privacy" target="_blank" rel="noopener">מדיניות הפרטיות</a>.
        </span>
      </label>
      {error && <p className="msg-err" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "שולח..." : submitLabel}
      </button>
    </form>
  );
}
