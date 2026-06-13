"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "bidra-beta-notice-dismissed";

export default function BetaNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      setIsVisible(window.localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setIsVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage failures.
    }
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Bidra launch notice">
      <div className="relative rounded-3xl border border-blue-100 bg-blue-50/80 px-4 py-4 text-slate-800 shadow-sm sm:px-5">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl bg-white text-lg font-black text-slate-900 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50"
          aria-label="Dismiss notice"
        >
          x
        </button>

        <div className="pr-10">
          <p className="text-sm font-black text-slate-900">Bidra is opening up</p>
          <p className="mt-1 max-w-5xl text-sm font-medium leading-6 text-slate-700">
            We are welcoming early users while we grow the marketplace. List an item, explore local finds, and share feedback as we keep improving the experience.
          </p>

          <div className="mt-4">
            <Link
              href="/feedback"
              className="inline-flex rounded-2xl border border-blue-100 bg-white px-4 py-2 text-sm font-black text-[#4F46E5] shadow-sm hover:bg-blue-50"
            >
              Share feedback
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}