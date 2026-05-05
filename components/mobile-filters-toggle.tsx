"use client";

import { useState } from "react";

export default function MobileFiltersToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = "mobile-listing-filters-panel";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-left font-extrabold shadow-sm flex items-center justify-between"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{open ? "Hide filters" : "Show filters"}</span>
        <span className="text-black/50 text-sm" aria-hidden="true">{open ? "-" : "+"}</span>
      </button>

      {open ? (
        <div id={panelId} className="mt-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="mb-2 text-xs text-black/60">Change filters, then tap <b>Show results</b>.</div>
          <div className="[&_form]:space-y-3 [&_input]:bg-white [&_select]:bg-white">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
