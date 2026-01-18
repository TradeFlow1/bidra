"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    const sp = pathname === "/listings"
  ? new URLSearchParams(searchParams?.toString() || "")
  : new URLSearchParams();

const v = (q || "").trim();
if (v) sp.set("q", v);
else sp.delete("q");

const qs = sp.toString();
router.push(qs ? `/listings?${qs}` : "/listings");
  }

  return (
    <form onSubmit={submit} className="hidden md:block">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search listings"
        className="border rounded px-3 py-1 text-sm w-64"
      />
    </form>
  );
}
