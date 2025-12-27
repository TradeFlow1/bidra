"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ListingSeed = {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  priceDollars: number;
  imageUrls: string;
};

export default function EditListingClient({ listing }: { listing: ListingSeed }) {
  const router = useRouter();

  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [category, setCategory] = useState(listing.category);
  const [condition, setCondition] = useState(listing.condition);
  const [location, setLocation] = useState(listing.location);
  const [price, setPrice] = useState(String(listing.priceDollars || ""));
  const [imageUrls, setImageUrls] = useState(listing.imageUrls);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (title.trim().length < 3) return "Title must be at least 3 characters.";
    const p = Number(price);
    if (!Number.isFinite(p)) return "Price must be a number.";
    if (p <= 0) return "Price must be greater than $0.";
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">Edit listing</h1>

      {error ? (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm">
          <div className="font-semibold">Fix this first:</div>
          <div className="mt-1">{error}</div>
        </div>
      ) : null}

      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);

          const v = validate();
          if (v) {
            setError(v);
            return;
          }

          setIsSaving(true);
          try {
            const images = imageUrls
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            const body = {
              title: title.trim(),
              description: description.trim(),
              category: category.trim(),
              condition: condition.trim(),
              location: location.trim(),
              price: Math.round(Number(price) * 100),
              images,
            };

            const res = await fetch(`/api/listings/${listing.id}/update`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setError(String(data?.error || `Update failed (HTTP ${res.status})`));
              return;
            }

            router.push(`/listings/${listing.id}`);
            router.refresh();
          } catch (err: any) {
            setError(String(err?.message || err));
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <div>
          <label className="text-sm font-medium">Title *</label>
          <input className="mt-1 w-full rounded-md border p-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea className="mt-1 w-full rounded-md border p-2" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Category</label>
            <input className="mt-1 w-full rounded-md border p-2" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Condition</label>
            <input className="mt-1 w-full rounded-md border p-2" value={condition} onChange={(e) => setCondition(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <input className="mt-1 w-full rounded-md border p-2" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Price (AUD) *</label>
            <input className="mt-1 w-full rounded-md border p-2" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" required />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Image URLs (comma separated)</label>
          <input className="mt-1 w-full rounded-md border p-2" value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} />
        </div>

        <button type="submit" disabled={isSaving} className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60">
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </main>
  );
}