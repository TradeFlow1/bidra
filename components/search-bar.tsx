"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/listings?q=${encodeURIComponent(q)}`);
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
