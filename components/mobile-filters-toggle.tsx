"use client";

import { useState } from "react";

export default function MobileFiltersToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = "mobile-listing-filters-panel";

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-11 w-full items-center justify-between rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-left font-extrabold text-[#0F172A] shadow-sm"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{open ? "Hide filters" : "Filters"}</span>
        <span className="text-black/50 text-sm" aria-hidden="true">{open ? "-" : "+"}</span>
      </button>

      {open ? (
        <div id={panelId} className="mt-3 rounded-2xl border border-[#D8E1F0] bg-white p-4 shadow-sm">
        <div className="mb-2 text-xs text-black/60">Change filters, then tap <b>Show results</b>.</div>
          <div className="[&_form]:space-y-3 [&_input]:bg-white [&_select]:bg-white">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
