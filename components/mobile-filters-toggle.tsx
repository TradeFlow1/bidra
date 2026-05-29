"use client";

import { useEffect, useId, useState } from "react";

type MobileFiltersToggleProps = {
  children: React.ReactNode;
};

export default function MobileFiltersToggle({ children }: MobileFiltersToggleProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(function () {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return function cleanup() {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={function () { setOpen(true); }}
        aria-expanded={open}
        aria-controls={panelId}
        className="bd-mobile-tap-target flex w-full items-center justify-between rounded-2xl border border-[#D8E1F0] bg-[#0F172A] px-4 py-3 text-left text-sm font-extrabold text-white shadow-sm"
      >
        <span>Filters</span>
        <span className="rounded-full bg-white/15 px-2 py-1 text-xs font-bold">Search, sort, refine</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] xl:hidden" role="dialog" aria-modal="true" aria-labelledby={panelId + "-title"}>
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={function () { setOpen(false); }}
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[28px] border border-[#D8E1F0] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3">
              <div>
                <div id={panelId + "-title"} className="text-base font-extrabold text-[#0F172A]">Filter listings</div>
                <p className="mt-0.5 text-xs leading-5 text-[#64748B]">Narrow results by keyword, category, location, price, condition, and sort.</p>
              </div>
              <button
                type="button"
                onClick={function () { setOpen(false); }}
                className="bd-mobile-tap-target inline-flex min-w-11 items-center justify-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] text-xl font-bold text-[#0F172A]"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(88vh-76px)] overflow-y-auto px-4 py-4">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
