"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import Link from "next/link";

type ListingSeed = {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  priceDollars: number;
  images: string[];
};

function dollarsToCents(v: string): number {
  const n = Number((v ?? "").trim());
  return Math.round(n * 100);
}

export default function EditListingClient({ listing }: { listing: ListingSeed }) {
  const router = useRouter();

  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [category, setCategory] = useState(listing.category);
  const [condition, setCondition] = useState(listing.condition);
  const [location, setLocation] = useState(listing.location);
  const [price, setPrice] = useState(String(listing.priceDollars || ""));

  // Existing saved URLs
  const [existingImages, setExistingImages] = useState<string[]>(
    Array.isArray(listing.images) ? listing.images.filter(Boolean).slice(0, 10) : []
  );

  // New uploads (files)
  const [files, setFiles] = useState<File[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(() => {
    return files.slice(0, 10).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }, [files]);

  function validate(): string | null {
    if (title.trim().length < 3) return "Title must be at least 3 characters.";
    const p = Number(price);
    if (!Number.isFinite(p)) return "Price must be a number.";
    if (p <= 0) return "Price must be greater than $0.";

    const total = (existingImages?.length || 0) + (files?.length || 0);
    if (total > 10) return "Too many images (max 10 total).";

    return null;
  }

  async function uploadFilesIfAny(): Promise<string[]> {
    if (!files.length) return [];
    const fd = new FormData();
    for (const f of files.slice(0, 10)) fd.append("files", f);

    const up = await fetch("/api/uploads/images", { method: "POST", body: fd });
    const upText = await up.text();
    let upData: any = null;
    try {
      upData = JSON.parse(upText);
    } catch {
      upData = null;
    }

    if (!up.ok) {
      const msg = upData?.error ? String(upData.error) : (upText || "Image upload failed.");
      throw new Error(msg);
    }

    const urls = Array.isArray(upData?.urls) ? upData.urls : [];
    return urls.filter(Boolean);
  }

  return (
    <main className="bd-container py-10">
      <div className="container max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Edit listing</h1>
              <div className="mt-1 text-sm bd-ink2">Update your listing details and photos.</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/listings" className="bd-btn bd-btn-ghost text-center">
                My listings
              </Link>
              <Link href={`/listings/${listing.id}`} className="bd-btn bd-btn-primary text-center">
                View listing
              </Link>
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
                  const uploadedUrls = await uploadFilesIfAny();
                  const finalImages = [...existingImages, ...uploadedUrls].filter(Boolean).slice(0, 10);

                  const body = {
                    title: title.trim(),
                    description: description.trim(),
                    category: category.trim(),
                    condition: condition.trim(),
                    location: location.trim(),
                    price: dollarsToCents(price),
                    images: finalImages,
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
                  previews.forEach((p) => URL.revokeObjectURL(p.url));
                  setFiles([]);
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

              {/* Photos */}
              <div className="grid gap-2">
                <div className="text-sm font-extrabold bd-ink">Photos</div>
                <div className="text-xs bd-ink2">
                  Add or remove photos. Max 10 total.
                </div>

                {existingImages.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {existingImages.map((url, idx) => (
                      <div key={url + idx} className="relative overflow-hidden rounded-xl border border-black/10 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Listing photo" className="h-28 w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-2 top-2 bd-btn bd-btn-ghost"
                          onClick={() => {
                            setExistingImages((cur) => cur.filter((_, i) => i !== idx));
                          }}
                          aria-label="Remove photo"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm bd-ink2">No photos yet.</div>
                )}

                <div className="grid gap-2 pt-1">
                  <label className="text-sm font-extrabold bd-ink">Add photos</label>
                  <input
                    className="bd-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const next = Array.from(e.target.files || []);
                      setFiles(next.slice(0, 10));
                    }}
                  />

                  {previews.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {previews.map((p) => (
                        <div key={p.url} className="overflow-hidden rounded-xl border border-black/10 bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt={p.name} className="h-28 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
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
