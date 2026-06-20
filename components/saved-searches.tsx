"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SavedSearch = {
  id: string;
  label: string;
  href: string;
  createdAt: string;
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

export function SaveSearchButton({ className = "" }: { className?: string }) {
  const [saved, setSaved] = useState(false);
  const [label, setLabel] = useState("Save search");

  useEffect(() => {
    const href = window.location.pathname + window.location.search;
    const items = readSavedSearches();
    setSaved(items.some((item) => item.href === href));
    setLabel(labelFromSearch(window.location.search));
  }, []);

  function saveSearch() {
    const href = window.location.pathname + window.location.search;
    const nextItem: SavedSearch = {
      id: href,
      label,
      href,
      createdAt: new Date().toISOString(),
    };
    const existing = readSavedSearches().filter((item) => item.href !== href);
    writeSavedSearches([nextItem, ...existing]);
    setSaved(true);
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

  const orderedItems = useMemo(() => items.slice(0, 10), [items]);

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

  function removeSearch(id: string) {
    const next = readSavedSearches().filter((item) => item.id !== id);
    writeSavedSearches(next);
    setItems(next);
  }

  return (
    <div className="rounded-[24px] border border-[#DCE5F2] bg-white p-4 shadow-sm md:p-6" id="saved-searches">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F46E5]">Saved searches</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Search again fast</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#64748B]">
            Save useful filters for suburb, category, handover and price. Alerts can build on this foundation later.
          </p>
        </div>
        <Link href="/listings" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-6 text-sm font-black !text-white">
          Browse listings
        </Link>
      </div>

      <div className="mt-5 divide-y divide-[#E2E8F0] overflow-hidden rounded-2xl border border-[#E2E8F0]">
        {orderedItems.length ? orderedItems.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link href={item.href} className="block truncate text-sm font-black text-[#0F172A] hover:text-[#4F46E5]">
                {item.label || "Saved listing search"}
              </Link>
              <p className="mt-1 truncate text-xs font-bold text-[#64748B]">{item.href}</p>
            </div>
            <button type="button" onClick={() => removeSearch(item.id)} className="h-10 rounded-2xl border border-[#D8E1F0] px-4 text-xs font-black text-[#3730A3] hover:bg-[#EEF2FF]">
              Remove
            </button>
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
