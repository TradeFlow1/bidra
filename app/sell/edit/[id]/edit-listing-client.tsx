"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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

export default function EditListingClient({ listing }: { listing: ListingSeed }) {
  const router = useRouter();

  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [category, setCategory] = useState(listing.category);
  const [condition, setCondition] = useState(listing.condition);
  const [location, setLocation] = useState(listing.location);
  const [price, setPrice] = useState(String(listing.priceDollars || ""));
  const [images, setImages] = useState<string[]>(Array.isArray(listing.images) ? listing.images : []);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  function validate(): string | null {
    if (title.trim().length < 3) return "Title must be at least 3 characters.";
    const p = Number(price);
    if (!Number.isFinite(p)) return "Price must be a number.";
    if (p <= 0) return "Price must be greater than $0.";
    if (images.length > 10) return "Too many photos (max 10).";
    return null;
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const current = images.slice();
    if (current.length >= 10) {
      setError("You already have 10 photos (max). Remove one to add more.");
      return;
    }

    const room = 10 - current.length;
    const picked = Array.from(files).slice(0, room);

    setIsUploading(true);
    setError(null);
    try {
      const form = new FormData();
      for (const f of picked) form.append("files", f);

      const res = await fetch("/api/uploads/images", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String((data as any)?.error || `Upload failed (HTTP ${res.status})`));
        return;
      }

      const urls: string[] = Array.isArray((data as any)?.urls) ? (data as any).urls : [];
      if (urls.length === 0) {
        setError("Upload failed: no URLs returned.");
        return;
      }

      const next = [...current, ...urls].slice(0, 10);
      setImages(next);
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((x) => x !== url));
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
                  const body = {
                    title: title.trim(),
                    description: description.trim(),
                    category: category.trim(),
                    condition: condition.trim(),
                    location: location.trim(),
                    price: Math.round(Number(price) * 100),
                    images: images.slice(0, 10),
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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="text-sm font-extrabold bd-ink">Photos</label>
                    <div className="mt-1 text-xs bd-ink2">Up to 10 photos. Add/remove without deleting the ad.</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => uploadFiles(e.target.files)}
                      disabled={isSaving || isUploading}
                    />
                    <button
                      type="button"
                      className="bd-btn bd-btn-ghost"
                      disabled={isSaving || isUploading || images.length >= 10}
                      onClick={() => fileRef.current?.click()}
                    >
                      {isUploading ? "Uploading..." : "Add photos"}
                    </button>
                  </div>
                </div>

                {images.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-black/10 bg-white p-4 text-sm bd-ink2">
                    No photos yet.
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((url) => (
                      <div key={url} className="relative overflow-hidden rounded-xl border border-black/10 bg-white">
                        <img
                          src={url}
                          alt="Listing photo"
                          className="block h-28 w-full object-cover"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 rounded-lg border border-black/10 bg-white px-2 py-1 text-xs font-extrabold bd-ink hover:bg-neutral-50"
                          onClick={() => removeImage(url)}
                          disabled={isSaving || isUploading}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button type="submit" disabled={isSaving || isUploading} className="bd-btn bd-btn-primary text-center">
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
