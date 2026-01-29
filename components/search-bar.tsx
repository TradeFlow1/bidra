"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({
  className = "",
  inputClassName = "",
  placeholder = "Search listings",
}: {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState("");

  // Keep input in sync with URL (?q=) so it behaves correctly when navigating back/forward
  useEffect(() => {
    const current = (searchParams?.get("q") || "").toString();
    setQ(current);
  }, [searchParams]);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const v = (q || "").trim();
    if (!v) return;

    // If we're already on /listings, preserve existing filters
    const sp =
      pathname === "/listings"
        ? new URLSearchParams(searchParams?.toString() || "")
        : new URLSearchParams();

    sp.set("q", v);

    const qs = sp.toString();
    router.push(qs ? `/listings?${qs}` : "/listings");
  }

  return (
    <form onSubmit={submit} className={className}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
    </form>
  );
}
