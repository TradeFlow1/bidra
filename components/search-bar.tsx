"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function SearchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 21-4.35-4.35" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

export default function SearchBar({
  className = "",
  inputClassName = "",
  placeholder = "Search cars, tools, furniture, phones...",
}: {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState("");

  useEffect(() => {
    const current = (searchParams?.get("q") || "").toString();
    setQ(current);
  }, [searchParams]);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const v = (q || "").trim();
    if (!v) return;

    const sp =
      pathname === "/listings"
        ? new URLSearchParams(searchParams?.toString() || "")
        : new URLSearchParams();

    sp.set("q", v);

    const qs = sp.toString();
    router.push(qs ? `/listings?${qs}` : "/listings");
  }

  return (
    <form onSubmit={submit} className={className} role="search">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/58">
          <SearchIcon />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className={
            inputClassName ||
            "h-12 w-full rounded-2xl border border-white/15 bg-white/10 pl-12 pr-4 text-sm font-bold text-white outline-none placeholder:text-white/52 focus:border-white/40 focus:ring-4 focus:ring-white/10"
          }
        />
      </div>
    </form>
  );
}