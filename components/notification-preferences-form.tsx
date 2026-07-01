"use client";

import { useEffect, useState } from "react";

type Preferences = {
  messages: boolean;
  offers: boolean;
  watchlist: boolean;
  savedSearches: boolean;
  feedback: boolean;
  productUpdates: boolean;
  marketing: boolean;
  emailDigest: boolean;
};

const defaultPreferences: Preferences = {
  messages: true,
  offers: true,
  watchlist: true,
  savedSearches: true,
  feedback: true,
  productUpdates: false,
  marketing: false,
  emailDigest: false,
};

const rows: Array<{ key: keyof Preferences; title: string; body: string }> = [
  { key: "messages", title: "Messages", body: "Buyer and seller message activity for listings and handover details." },
  { key: "offers", title: "Offers", body: "Offer activity, accepted offers and seller decisions." },
  { key: "watchlist", title: "Watchlist updates", body: "Saved item changes such as availability, recorded price drops and public activity." },
  { key: "savedSearches", title: "Saved-search alerts", body: "Account-synced saved search alerts for matching listing activity." },
  { key: "feedback", title: "Feedback reminders", body: "Optional feedback reminders after handover is arranged externally." },
  { key: "emailDigest", title: "Email digest", body: "A periodic summary preference for future email delivery support." },
  { key: "productUpdates", title: "Product updates", body: "Bidra feature and safety update preference." },
  { key: "marketing", title: "Marketing", body: "Promotional product communication preference. Off by default." },
];

export default function NotificationPreferencesForm() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [status, setStatus] = useState("Loading preferences...");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/notification-preferences", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.preferences) {
          setPreferences({ ...defaultPreferences, ...data.preferences });
          setStatus("Preferences loaded");
        } else {
          setStatus("Using default preferences");
        }
      })
      .catch(() => setStatus("Using default preferences"));
  }, []);

  async function save(next: Preferences) {
    setSaving(true);
    setStatus("Saving...");
    setPreferences(next);
    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.preferences) {
        setStatus("Could not save preferences");
        return;
      }
      setPreferences({ ...defaultPreferences, ...data.preferences });
      setStatus("Preferences saved");
    } catch {
      setStatus("Could not save preferences");
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: keyof Preferences) {
    const next = { ...preferences, [key]: !preferences[key] };
    void save(next);
  }

  return (
    <section className="rounded-[32px] border border-[#E7DEF4] bg-[linear-gradient(135deg,#ffffff_0%,#FCFBFF_55%,#F5F3FF_100%)] p-4 shadow-[0_24px_64px_rgba(18,7,36,0.08)] md:p-6" id="notification-preferences">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7C3AED]">Notification preferences</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#120724]">Choose what Bidra surfaces for you</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#62516F]">Control account-level update categories. These settings do not add payment, shipping, pickup scheduling or completion workflows.</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${saving ? "border-[#DDD6FE] bg-[#F5F3FF] text-[#6D28D9]" : "border-[#E7DEF4] bg-white text-[#475569]"}`}>{saving ? "Saving" : status}</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {rows.map((row) => {
          const enabled = preferences[row.key];
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => toggle(row.key)}
              className={`rounded-[24px] border p-4 text-left shadow-sm transition ${enabled ? "border-[#DDD6FE] bg-white/95 shadow-[0_16px_36px_rgba(124,58,237,0.10)]" : "border-[#E7DEF4] bg-[#F8FAFF] hover:border-[#C7D2FE] hover:bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-[#120724]">{row.title}</div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#62516F]">{row.body}</p>
                </div>
                <span className={enabled ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800" : "rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"}>{enabled ? "On" : "Off"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
