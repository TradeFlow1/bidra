"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SavedSearch = {
  id: string;
  label: string;
  href: string;
  createdAt: string;
  alertEnabled?: boolean;
  lastCheckedAt?: string;
};

const STORAGE_KEY = "bidra:saved-searches:v1";

function readSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.href === "string") : [];
  } catch {
    return [];
  }
}

function writeSavedSearches(items: SavedSearch[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
  window.dispatchEvent(new CustomEvent("bidra:saved-searches-changed"));
}

function shortDate(value?: string) {
  if (!value) return "Not checked yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not checked yet";
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export default function SearchAlertsPanel() {
  const [items, setItems] = useState<SavedSearch[]>([]);

  const activeAlerts = useMemo(() => items.filter((item) => item.alertEnabled).slice(0, 8), [items]);

  useEffect(() => {
    function refresh() {
      setItems(readSavedSearches());
    }
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("bidra:saved-searches-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("bidra:saved-searches-changed", refresh);
    };
  }, []);

  function markChecked(id: string) {
    const next = readSavedSearches().map((item) => item.id === id ? { ...item, lastCheckedAt: new Date().toISOString() } : item);
    writeSavedSearches(next);
    setItems(next);
  }

  function turnOff(id: string) {
    const next = readSavedSearches().map((item) => item.id === id ? { ...item, alertEnabled: false } : item);
    writeSavedSearches(next);
    setItems(next);
  }

  return (
    <section className="rounded-[22px] border border-[#D7E2F1] bg-white p-4 shadow-sm md:rounded-3xl md:p-5" id="search-alerts">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-extrabold bd-ink">Search alerts</div>
          <div className="mt-2 text-sm bd-ink2">
            In-app alerts for saved searches. Open a saved search to see the newest matching listings.
          </div>
        </div>
        <Link href="/account#saved-searches" className="inline-flex w-fit rounded-2xl border border-[#C7D2FE] bg-white px-4 py-2 text-sm font-black text-[#4F46E5] shadow-sm">
          Manage alerts
        </Link>
      </div>

      <div className="mt-4 divide-y divide-[#E2E8F0] overflow-hidden rounded-2xl border border-[#E2E8F0]">
        {activeAlerts.length ? activeAlerts.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link href={item.href} onClick={() => markChecked(item.id)} className="block truncate text-sm font-black text-[#0F172A] hover:text-[#4F46E5]">
                {item.label || "Saved search alert"}
              </Link>
              <p className="mt-1 truncate text-xs font-bold text-[#64748B]">Last opened: {shortDate(item.lastCheckedAt)}</p>
            </div>
            <button type="button" onClick={() => turnOff(item.id)} className="h-10 rounded-2xl border border-[#D8E1F0] px-4 text-xs font-black text-[#3730A3] hover:bg-[#EEF2FF]">
              Turn off
            </button>
          </div>
        )) : (
          <div className="p-4 text-sm font-semibold text-[#64748B]">
            No search alerts are on yet. Save a listing search, then turn on alerts from Account.
          </div>
        )}
      </div>
    </section>
  );
}
