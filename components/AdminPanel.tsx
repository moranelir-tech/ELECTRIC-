"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lead, Provider } from "@/lib/types";

type Tab = "providers" | "leads";

const EMPTY: Provider = {
  id: "",
  slug: "",
  name: "",
  plan: "",
  discountPercent: 0,
  hours: "",
  minMonthlyBill: 0,
  commitment: "",
  notes: "",
  affiliateUrl: "",
  featured: false,
  active: true,
  sortOrder: 0,
  clicks: 0,
};

export default function AdminPanel() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("providers");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    const pr = await fetch("/api/admin/providers");
    if (pr.status === 401) {
      setAuthed(false);
      return;
    }
    setProviders(await pr.json());
    const lr = await fetch("/api/admin/leads");
    if (lr.ok) setLeads(await lr.json());
    setAuthed(true);
    setDirty(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setLoginError(d.error || "שגיאה בכניסה");
      return;
    }
    setPassword("");
    load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  function update(i: number, patch: Partial<Provider>) {
    setProviders((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
    setDirty(true);
  }

  function addRow() {
    setProviders((list) => [...list, { ...EMPTY, sortOrder: list.length + 1 }]);
    setDirty(true);
  }

  function removeRow(i: number) {
    if (!confirm("למחוק את הספק מהטבלה? אפשר גם פשוט לבטל את ההצגה בעמודה 'פעיל'.")) return;
    setProviders((list) => list.filter((_, idx) => idx !== i));
    setDirty(true);
  }

  async function save() {
    setMsg(null);
    const res = await fetch("/api/admin/providers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(providers),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg({ ok: false, text: d.error || "שמירה נכשלה" });
      return;
    }
    setMsg({ ok: true, text: "נשמר. האתר עודכן." });
    load();
  }

  if (authed === null) return <p>טוען...</p>;

  if (!authed) {
    return (
      <form className="card form" style={{ maxWidth: 380, marginInline: "auto" }} onSubmit={login}>
        <h1>כניסה לניהול</h1>
        <input
          className="input"
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          aria-label="סיסמה"
        />
        {loginError && <p className="msg-err" role="alert">{loginError}</p>}
        <button className="btn btn-primary">כניסה</button>
      </form>
    );
  }

  return (
    <div>
      <div className="toolbar" style={{ justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>ניהול האתר</h1>
        <button className="btn btn-ghost" onClick={logout}>יציאה</button>
      </div>

      <div className="admin-tabs" role="tablist">
        <button className={`tab ${tab === "providers" ? "on" : ""}`} onClick={() => setTab("providers")}>
          ספקים ותעריפים ({providers.length})
        </button>
        <button className={`tab ${tab === "leads" ? "on" : ""}`} onClick={() => setTab("leads")}>
          לידים ({leads.length})
        </button>
      </div>

      {tab === "providers" && (
        <>
          <div className="toolbar">
            <button className="btn btn-primary" onClick={save} disabled={!dirty}>שמירת שינויים</button>
            <button className="btn btn-ghost" onClick={addRow}>+ הוספת ספק</button>
            {dirty && <span className="small">יש שינויים שלא נשמרו</span>}
            {msg && <span className={msg.ok ? "msg-ok" : "msg-err"}>{msg.text}</span>}
          </div>
          <div className="scroll-x">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>סדר</th>
                  <th>פעיל</th>
                  <th>מומלץ</th>
                  <th>שם ספק</th>
                  <th>מזהה (אנגלית)</th>
                  <th>מסלול</th>
                  <th>הנחה %</th>
                  <th>שעות</th>
                  <th>חשבון מינימלי ₪</th>
                  <th>התחייבות</th>
                  <th>קישור שותפים</th>
                  <th>הערות</th>
                  <th>קליקים</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p, i) => (
                  <tr key={p.id || `new-${i}`}>
                    <td><input type="number" value={p.sortOrder} onChange={(e) => update(i, { sortOrder: Number(e.target.value) })} style={{ minWidth: 60 }} /></td>
                    <td><input type="checkbox" checked={p.active} onChange={(e) => update(i, { active: e.target.checked })} /></td>
                    <td><input type="checkbox" checked={p.featured} onChange={(e) => update(i, { featured: e.target.checked })} /></td>
                    <td><input type="text" value={p.name} onChange={(e) => update(i, { name: e.target.value })} /></td>
                    <td><input type="text" dir="ltr" value={p.slug} onChange={(e) => update(i, { slug: e.target.value })} /></td>
                    <td><input type="text" value={p.plan} onChange={(e) => update(i, { plan: e.target.value })} /></td>
                    <td><input type="number" step="0.1" value={p.discountPercent} onChange={(e) => update(i, { discountPercent: Number(e.target.value) })} style={{ minWidth: 70 }} /></td>
                    <td><input type="text" value={p.hours} onChange={(e) => update(i, { hours: e.target.value })} /></td>
                    <td><input type="number" value={p.minMonthlyBill} onChange={(e) => update(i, { minMonthlyBill: Number(e.target.value) })} style={{ minWidth: 80 }} /></td>
                    <td><input type="text" value={p.commitment} onChange={(e) => update(i, { commitment: e.target.value })} /></td>
                    <td><input type="url" dir="ltr" value={p.affiliateUrl} onChange={(e) => update(i, { affiliateUrl: e.target.value })} /></td>
                    <td><input type="text" value={p.notes} onChange={(e) => update(i, { notes: e.target.value })} /></td>
                    <td>{p.clicks}</td>
                    <td><button className="btn btn-ghost" onClick={() => removeRow(i)} aria-label="מחיקת ספק">מחיקה</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "leads" && (
        <>
          <div className="toolbar">
            <a className="btn btn-primary" href="/api/admin/leads/export">ייצוא ל-Excel (CSV)</a>
            <button className="btn btn-ghost" onClick={load}>רענון</button>
          </div>
          <div className="scroll-x">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>אימייל</th>
                  <th>חשבון חודשי</th>
                  <th>ספק</th>
                  <th>מקור</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr><td colSpan={7}>אין לידים עדיין</td></tr>
                )}
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>{new Date(l.createdAt).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}</td>
                    <td>{l.name}</td>
                    <td dir="ltr">{l.phone}</td>
                    <td dir="ltr">{l.email}</td>
                    <td>{l.monthlyBill ?? ""}</td>
                    <td>{l.providerSlug ?? ""}</td>
                    <td>{l.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
