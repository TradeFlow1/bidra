"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SavedSearch = {
  id: string;
  label: string;
  href: string;
  createdAt: string;
  updatedAt?: string;
  alertEnabled?: boolean;
  lastCheckedAt?: string | null;
  lastMatchCount?: number;
  source?: "local" | "persisted";
};

const STORAGE_KEY = "bidra:saved-searches:v1";

function readSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is SavedSearch => item && typeof item.href === "string") : [];
  } catch {
    return [];
  }
}

function writeSavedSearches(items: SavedSearch[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
  window.dispatchEvent(new CustomEvent("bidra:saved-searches-changed"));
}

function labelFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const parts = [
    params.get("q") ? `Search: ${params.get("q")}` : "Listings",
    params.get("category") || "",
    params.get("location") || params.get("state") || "",
    params.get("radius") ? `${params.get("radius")} km` : "",
    params.get("fulfillment") || "",
    params.get("type") || "",
  ].filter(Boolean);

  return parts.join(" - ").slice(0, 90);
}

function enabledCount(items: SavedSearch[]) {
  return items.filter((item) => item.alertEnabled).length;
}

async function fetchPersistedSearches(): Promise<SavedSearch[] | null> {
  const res = await fetch("/api/saved-searches", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return Array.isArray(data?.savedSearches) ? data.savedSearches.map((item: SavedSearch) => ({ ...item, source: "persisted" as const })) : [];
}

async function persistSearch(item: SavedSearch): Promise<SavedSearch | null> {
  const res = await fetch("/api/saved-searches", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ label: item.label, href: item.href, alertEnabled: !!item.alertEnabled }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.savedSearch ? { ...data.savedSearch, source: "persisted" as const } : null;
}

export function SaveSearchButton({ className = "" }: { className?: string }) {
  const [saved, setSaved] = useState(false);
  const [label, setLabel] = useState("Save search");

  useEffect(() => {
    const href = window.location.pathname + window.location.search;
    const items = readSavedSearches();
    setSaved(items.some((item) => item.href === href));
    setLabel(labelFromSearch(window.location.search));

    fetchPersistedSearches().then((persisted) => {
      if (!persisted) return;
      setSaved(persisted.some((item) => item.href === href));
    }).catch(() => {});
  }, []);

  async function saveSearch() {
    const href = window.location.pathname + window.location.search;
    const existingItem = readSavedSearches().find((item) => item.href === href);
    const nextItem: SavedSearch = {
      id: href,
      label,
      href,
      createdAt: existingItem?.createdAt || new Date().toISOString(),
      alertEnabled: existingItem?.alertEnabled || false,
      lastCheckedAt: existingItem?.lastCheckedAt,
      source: "local",
    };
    const existing = readSavedSearches().filter((item) => item.href !== href);
    writeSavedSearches([nextItem, ...existing]);
    setSaved(true);

    const persisted = await persistSearch(nextItem).catch(() => null);
    if (persisted) {
      const local = readSavedSearches().filter((item) => item.href !== href);
      writeSavedSearches([{ ...persisted, id: persisted.href, source: "local" }, ...local]);
    }
  }

  return (
    <button
      type="button"
      onClick={saveSearch}
      className={className || "inline-flex h-12 items-center justify-center rounded-2xl border border-[#C7D2FE] bg-white px-5 text-sm font-black text-[#4F46E5] shadow-sm hover:bg-[#EEF2FF]"}
    >
      {saved ? "Saved search" : "Save search"}
    </button>
  );
}

export function SavedSearchesPanel() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [persistedAvailable, setPersistedAvailable] = useState(false);

  const orderedItems = useMemo(() => items.slice(0, 10), [items]);
  const alertsOn = enabledCount(items);

  useEffect(() => {
    async function refresh() {
      const local = readSavedSearches().map((item) => ({ ...item, source: "local" as const }));
      const persisted = await fetchPersistedSearches().catch(() => null);
      if (persisted) {
        setPersistedAvailable(true);
        const seen = new Set<string>();
        const merged = [...persisted, ...local].filter((item) => {
          const key = item.href;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setItems(merged);
        return;
      }
      setPersistedAvailable(false);
      setItems(local);
    }

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("bidra:saved-searches-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("bidra:saved-searches-changed", refresh);
    };
  }, []);

  async function removeSearch(item: SavedSearch) {
    const next = readSavedSearches().filter((entry) => entry.id !== item.id && entry.href !== item.href);
    writeSavedSearches(next);
    setItems((current) => current.filter((entry) => entry.id !== item.id && entry.href !== item.href));

    if (item.source === "persisted") {
      await fetch(`/api/saved-searches/${encodeURIComponent(item.id)}`, { method: "DELETE" }).catch(() => null);
    }
  }

  async function toggleAlert(item: SavedSearch) {
    const nextEnabled = !item.alertEnabled;
    const nextLocal = readSavedSearches().map((entry) => entry.id === item.id || entry.href === item.href ? {
      ...entry,
      alertEnabled: nextEnabled,
      lastCheckedAt: new Date().toISOString(),
    } : entry);
    writeSavedSearches(nextLocal);
    setItems((current) => current.map((entry) => entry.id === item.id || entry.href === item.href ? { ...entry, alertEnabled: nextEnabled, lastCheckedAt: new Date().toISOString() } : entry));

    if (item.source === "persisted") {
      await fetch(`/api/saved-searches/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ alertEnabled: nextEnabled }),
      }).catch(() => null);
    } else {
      await persistSearch({ ...item, alertEnabled: nextEnabled }).catch(() => null);
    }
  }

  return (
    <div className="rounded-[24px] border border-[#DCE5F2] bg-white p-4 shadow-sm md:p-6" id="saved-searches">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F46E5]">Saved searches</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Search again fast</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#64748B]">
            Save useful filters for suburb, category, handover and price. Signed-in saved searches are persisted to your Bidra account, with browser-local fallback.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <span className="rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1 text-xs font-black text-[#3730A3]">
            {alertsOn} alerts on
          </span>
          <span className="rounded-full border border-[#D8E1F0] bg-white px-3 py-1 text-xs font-black text-[#475569]">
            {persistedAvailable ? "Account-synced" : "Browser-local"}
          </span>
          <Link href="/listings" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-6 text-sm font-black !text-white">
            Browse listings
          </Link>
        </div>
      </div>

      <div className="mt-5 divide-y divide-[#E2E8F0] overflow-hidden rounded-2xl border border-[#E2E8F0]">
        {orderedItems.length ? orderedItems.map((item) => (
          <div key={`${item.source || "local"}-${item.id}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link href={item.href} className="block truncate text-sm font-black text-[#0F172A] hover:text-[#4F46E5]">
                {item.label || "Saved listing search"}
              </Link>
              <p className="mt-1 truncate text-xs font-bold text-[#64748B]">{item.href}</p>
              <p className="mt-1 text-xs font-black text-[#64748B]">{item.source === "persisted" ? "Saved to account" : "Saved in this browser"}{item.alertEnabled ? " - Search alert on" : ""}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => toggleAlert(item)} className="h-10 rounded-2xl border border-[#C7D2FE] px-4 text-xs font-black text-[#3730A3] hover:bg-[#EEF2FF]">
                {item.alertEnabled ? "Alert on" : "Turn on alert"}
              </button>
              <button type="button" onClick={() => removeSearch(item)} className="h-10 rounded-2xl border border-[#D8E1F0] px-4 text-xs font-black text-[#3730A3] hover:bg-[#EEF2FF]">
                Remove
              </button>
            </div>
          </div>
        )) : (
          <div className="p-4 text-sm font-semibold text-[#64748B]">
            No saved searches yet. Browse listings, apply filters, then choose Save search.
          </div>
        )}
      </div>
    </div>
  );
}
