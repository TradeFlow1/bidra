"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

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
    <main className="bd-container py-10">
      <div className="container max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Edit listing</h1>
              <div className="mt-1 text-sm bd-ink2">Update your listing details.</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/listings" className="bd-btn bd-btn-ghost text-center">My listings</Link>
              <Link href={`/listings/${listing.id}`} className="bd-btn bd-btn-primary text-center">View listing</Link>
            </div>
          </div>

          {error ? (
            <div className="bd-card p-4 border border-red-200 bg-red-50/50">
              <div className="text-sm font-extrabold bd-ink">Fix this first</div>
              <div className="mt-1 text-sm bd-ink2">{error}</div>
            </div>
          ) : null}

          <div className="bd-card p-6">
            <form
              className="grid gap-4"
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
                    setError(String((data as any)?.error || `Update failed (HTTP ${res.status})`));
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
                <label className="text-sm font-extrabold bd-ink">Title *</label>
                <input
                  className="bd-input mt-1 w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-extrabold bd-ink">Description</label>
                <textarea
                  className="bd-input mt-1 w-full"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-extrabold bd-ink">Category</label>
                  <input
                    className="bd-input mt-1 w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-extrabold bd-ink">Condition</label>
                  <input
                    className="bd-input mt-1 w-full"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-extrabold bd-ink">Location</label>
                  <input
                    className="bd-input mt-1 w-full"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-extrabold bd-ink">Price (AUD) *</label>
                  <input
                    className="bd-input mt-1 w-full"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    inputMode="decimal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-extrabold bd-ink">Image URLs (comma separated)</label>
                <input
                  className="bd-input mt-1 w-full"
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button type="submit" disabled={isSaving} className="bd-btn bd-btn-primary text-center">
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <Link href={`/listings/${listing.id}`} className="bd-btn bd-btn-ghost text-center">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
