"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellNewClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const fd = new FormData(e.currentTarget);

      const title = String(fd.get("title") || "").trim();
      const description = String(fd.get("description") || "").trim();
      const category = String(fd.get("category") || "Electronics").trim();
      const condition = String(fd.get("condition") || "Used - Good").trim();
      const location = String(fd.get("location") || "QLD").trim();
      const priceDollars = Number(fd.get("price") || 0);

      const price = Math.round(priceDollars * 100);

      if (!title || !description) {
        setErr("Title and description are required.");
        setLoading(false);
        return;
      }
      if (!category || !condition || !location || !Number.isFinite(price) || price <= 0) {
        setErr("Please fill all fields and enter a valid price.");
        setLoading(false);
        return;
      }

      const payload = {
        title,
        description,
        category,
        condition,
        location,
        price,
        images: [],
        type: "BUY_NOW",
      };

      const res = await fetch("/api/listings/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.ok) {
        setErr(String(data?.error || "Failed to create listing."));
        setLoading(false);
        return;
      }

      router.push(`/listings/${data.id}`);
      router.refresh();
    } catch (e: any) {
      setErr(String(e?.message || e || "Failed to create listing."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {err ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
          {err}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          type="text"
          className="w-full rounded-md border px-3 py-2"
          placeholder="e.g. Makita drill"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          className="w-full rounded-md border px-3 py-2"
          rows={5}
          placeholder="Describe the item..."
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Category</label>
          <select name="category" className="w-full rounded-md border px-3 py-2" defaultValue="Electronics">
            <option>Electronics</option>
            <option>Tools</option>
            <option>Home</option>
            <option>Cars</option>
            <option>Collectables</option>
            <option>Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Condition</label>
          <select name="condition" className="w-full rounded-md border px-3 py-2" defaultValue="Used - Good">
            <option>New</option>
            <option>Used - Like New</option>
            <option>Used - Good</option>
            <option>Used - Fair</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Location</label>
          <select name="location" className="w-full rounded-md border px-3 py-2" defaultValue="QLD">
            <option>QLD</option>
            <option>NSW</option>
            <option>VIC</option>
            <option>SA</option>
            <option>WA</option>
            <option>TAS</option>
            <option>NT</option>
            <option>ACT</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Price (AUD)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-md border px-3 py-2"
            placeholder="e.g. 120.00"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create listing"}
      </button>
    </form>
  );
}
