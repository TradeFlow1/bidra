"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  "Electronics",
  "Home & Living",
  "Vehicles",
  "Machinery & Equipment",
  "Sports & Outdoors",
  "Fashion",
  "Kids & Baby",
  "Books & Media",
  "Other",
];

export default function WantedAdForm({ defaultLocation = "" }: { defaultLocation?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState(defaultLocation);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitWantedAd(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/wanted/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, location, budgetMin, budgetMax }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/auth/login?next=/wanted/new");
        return;
      }
      if (!res.ok) {
        setError(String(data?.error || `Wanted request failed (HTTP ${res.status})`));
        return;
      }
      router.push("/wanted?created=1");
      router.refresh();
    } catch (err: any) {
      setError(String(err?.message || err || "Wanted request failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submitWantedAd} className="grid gap-4 rounded-[28px] border border-[#D8E6F8] bg-white p-4 shadow-sm sm:p-6">
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</div> : null}

      <label className="block">
        <span className="text-sm font-black text-[#07152E]">What are you looking for?</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="e.g. Used iPhone 13, dining table, mower" required />
      </label>

      <label className="block">
        <span className="text-sm font-black text-[#07152E]">Details</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-32 w-full rounded-2xl border border-[#CBD5E1] px-4 py-3 text-sm font-semibold" placeholder="Include brand, size, condition, timing and whether pickup or postage works for you." required />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-black text-[#07152E]">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold" required>
            <option value="">Select category</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-black text-[#07152E]">Location</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Suburb or city" required />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-black text-[#07152E]">Budget from (optional)</span>
          <input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" inputMode="decimal" placeholder="100" />
        </label>

        <label className="block">
          <span className="text-sm font-black text-[#07152E]">Budget up to (optional)</span>
          <input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" inputMode="decimal" placeholder="400" />
        </label>
      </div>

      <div className="rounded-2xl border border-[#D8E6F8] bg-[#F8FAFF] p-3 text-sm font-semibold leading-6 text-[#526173]">
        Wanted ads help sellers see buyer demand. Sellers still create normal listings, and payment, pickup, delivery or postage is arranged directly in Bidra Messages.
      </div>

      <button type="submit" disabled={busy} className="h-12 rounded-2xl bg-[#4F46E5] px-5 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
        {busy ? "Posting..." : "Post wanted ad"}
      </button>
    </form>
  );
}
