"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FULL_CATEGORIES, CATEGORY_GROUPS , joinCategory} from "@/lib/categories";
import { isTimedOffersType } from "@/lib/listing-type";

function sanitizeDescriptionDisplay(input: string): string {
  const raw = String(input || "");
  const lines = raw.split(/\r?\n/);
  const keep: string[] = [];
  for (const l of lines) {
    const s = String(l || "").toLowerCase();
    const isPlaceholder =
      s.includes("included: (add") ||
      s.includes("reason for selling") ||
      s.includes("any marks or faults") ||
      s.includes("pickup location: (your suburb)");
    if (!isPlaceholder) keep.push(l);
  }
  return keep.join("\n").trim();
}


const SELLER_ALLOWED_STATUSES = ["DRAFT", "ACTIVE", "ENDED"] as const;
type SellerStatus = (typeof SELLER_ALLOWED_STATUSES)[number];

type ListingSeed = {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  priceDollars: number;
  images: string[];
  status: string;

  // Kevin timed-offers support
  type: string;
  endsAt: string | null;
  buyNowPriceDollars: number | null;
  highestOfferCents: number;
};

function dollarsToCents(v: string): number {
  const n = Number((v ?? "").trim());
  return Math.round(n * 100);
}

function hoursUntilIso(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  return ms / (1000 * 60 * 60);
}

function normalizeStatus(v: string): SellerStatus {
  const up = String(v || "").toUpperCase().trim();
  if ((SELLER_ALLOWED_STATUSES as readonly string[]).includes(up)) return up as SellerStatus;
  return "DRAFT";
}

export default function EditListingClient({ listing }: { listing: ListingSeed }) {
  const router = useRouter();

  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(sanitizeDescriptionDisplay(listing.description));
  const [category, setCategory] = useState(listing.category);
  const [condition, setCondition] = useState(listing.condition);
  const [location, setLocation] = useState(listing.location);
  const [price, setPrice] = useState(String(listing.priceDollars || ""));
  const [status, setStatus] = useState<SellerStatus>(normalizeStatus(listing.status));

  // Kevin timed-offers: late-stage Buy Now reveal (seller-controlled)
  const isTimedOffers = isTimedOffersType((listing as unknown as { type?: string }).type);
  const hoursLeft = useMemo(() => { const v = (listing as unknown as { endsAt?: string | Date | null | undefined }).endsAt; return hoursUntilIso(v instanceof Date ? v.toISOString() : (typeof v === "string" ? v : null)); }, [listing]);
  const inFinal24h = !!(isTimedOffers && typeof hoursLeft === "number" && hoursLeft > 0 && hoursLeft <= 24);

  const [buyNow, setBuyNow] = useState<string>(
  (listing as unknown as { buyNowPriceDollars?: number | null }).buyNowPriceDollars != null ? String((listing as unknown as { buyNowPriceDollars?: number | null }).buyNowPriceDollars) : ""
);
const [buyNowEnabled, setBuyNowEnabled] = useState<boolean>(((listing as unknown as { buyNowPriceDollars?: number | null }).buyNowPriceDollars) != null);
// Existing saved images
  const [existingImages, setExistingImages] = useState<string[]>(
    Array.isArray(listing.images) ? listing.images.filter(Boolean).slice(0, 10) : []
  );

  // New uploads (files)
  const [files, setFiles] = useState<File[]>([]);
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const addPicked = (picked: File[]) => {
    if (!picked || picked.length === 0) return;
    setFiles((prev) => [...prev, ...picked].slice(0, 10));
  };

  function moveImage(from: number, to: number) {
    setExistingImages((cur) => {
      if (from < 0 || to < 0 || from >= cur.length || to >= cur.length) return cur;
      const next = cur.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(() => {
    return files.slice(0, 10).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }, [files]);

  async function uploadAndAppend(nextFiles: File[]) {
    const remaining = 10 - (existingImages?.length || 0);
    if (remaining <= 0) {
      setError("Too many images (max 10 total).");
      return;
    }

    const picked = (nextFiles || []).slice(0, remaining);
    if (!picked.length) return;

    setError(null);
    setIsSaving(true);
    try {
      const fd = new FormData();
      for (const f of picked) fd.append("files", f);

      const up = await fetch("/api/uploads/images", { method: "POST", body: fd });
      const upText = await up.text();
      let upData: any = null;
      try {
        upData = JSON.parse(upText);
      } catch {
        upData = null;
      }

      if (!up.ok) {
        const msg = upData?.error ? String(upData.error) : upText || "Image upload failed.";
        setError(msg);
        return;
      }

      const uploaded = (Array.isArray(upData?.urls) ? upData.urls : []).filter(Boolean);
      if (!uploaded.length) {
        setError("Upload failed: no images returned.");
        return;
      }

      setExistingImages((cur) => [...cur, ...uploaded].filter(Boolean).slice(0, 10));
    } catch (e: any) {
      setError(String(e?.message || e || "Upload failed."));
    } finally {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setFiles([]);
            if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      setIsSaving(false);
    }
  }

  function validate(): string | null {
    if (title.trim().length < 3) return "Title must be at least 3 characters.";
    const p = Number(price);
    if (!Number.isFinite(p)) return "Price must be a number.";
    if (p <= 0) return "Price must be greater than $0.";

    const total = (existingImages?.length || 0) + (files?.length || 0);
    if (total > 10) return "Too many images (max 10 total).";

    // Late-stage Buy Now (timed offers only) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â allow blank to clear, but validate if provided
    if (isTimedOffers) {
      const s = String(buyNow ?? "").trim();
      if (s) {
        const n = Number(s);
        if (!Number.isFinite(n)) return "Buy Now must be a number.";
        if (n <= 0) return "Buy Now must be greater than $0.";
      }
    }

    return null;
  }

  async function endListing() {
    if (isSaving) return;
    if (!confirm("End this listing now? This will stop new offers and mark it as ended.")) return;

    setError(null);
    setIsSaving(true);
    try {
      const body: any = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        condition: condition.trim(),
        location: location.trim(),
        price: dollarsToCents(price),
        images: (existingImages || []).filter(Boolean).slice(0, 10),
        status: "ENDED",
      };

      // Preserve timed-offers buy now behavior if present in UI (do not force)
      if (isTimedOffers) {
        body.buyNowPrice =
          (!buyNowEnabled
            ? null
            : (inFinal24h && String(buyNow ?? "").trim()
                ? dollarsToCents(String(buyNow ?? "").trim())
                : null));
      }

      const res = await fetch(`/api/listings/${listing.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String((data as unknown as { error?: string })?.error || `End failed (HTTP ${res.status})`));
        return;
      }

      setStatus("ENDED");
      router.push("/dashboard/listings");
      router.refresh();
    } catch (e: any) {
      setError(String(e?.message || e || "End failed."));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteListing() {
    if (isSaving) return;
    if (!confirm("Delete this listing? It will be removed from public view.")) return;

    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}/delete`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String((data as unknown as { error?: string })?.error || `Delete failed (HTTP ${res.status})`));
        return;
      }

      router.push("/dashboard/listings");
      router.refresh();
    } catch (e: any) {
      setError(String(e?.message || e || "Delete failed."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="bd-container py-10">
      <div className="container max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Edit listing</h1>
              <div className="mt-1 text-sm bd-ink2">Update your listing details, status, price, and photos.</div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs bd-ink2">
                  Status: <span className="font-extrabold bd-ink">{status}</span>
                  {status === "ACTIVE" ? <span className="ml-2 inline-flex items-center rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] font-extrabold bd-ink">Live listing</span> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  form="editListingForm"
                  disabled={isSaving}
                  className="bd-btn bd-btn-primary text-center"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>

                <Link href={`/listings/${listing.id}`} className="bd-btn bd-btn-ghost text-center">
                  View listing
                </Link>

                {status === "ACTIVE" ? (
                  <button
                    type="button"
                    onClick={endListing}
                    disabled={isSaving}
                    className="bd-btn bd-btn-ghost text-center"
                  >
                    End listing
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={deleteListing}
                  disabled={isSaving}
                  className="bd-btn bd-btn-ghost text-center"
                >
                  Delete listing
                </button>

                <Link href="/dashboard/listings" className="bd-btn bd-btn-ghost text-center">
                  My listings
                </Link>
              </div>
            </div>
          </div>
          {error ? (
            <div className="bd-card p-4 border border-red-200 bg-red-50/50">
              <div className="text-sm font-extrabold bd-ink">Fix this first</div>
              <div className="mt-1 text-sm bd-ink2">{error}</div>
            </div>
          ) : null}

          <div className="bd-card p-6">
            <form id="editListingForm"
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
                    price: dollarsToCents(price),
                    images: (existingImages || []).filter(Boolean).slice(0, 10),
                    status,

                    // Kevin timed-offers: seller-controlled late Buy Now reveal
buyNowPrice:
  isTimedOffers
    ? (!buyNowEnabled
        ? null // clear (allowed any time)
        : (inFinal24h && String(buyNow ?? "").trim()
            ? dollarsToCents(String(buyNow ?? "").trim())
            : null)) // not in final 24h -> do not set (avoid server rejection)
    : undefined,
};

                  const res = await fetch(`/api/listings/${listing.id}/update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  });

                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setError(String((data as unknown as { error?: string })?.error || `Update failed (HTTP ${res.status})`));
                    return;
                  }

                  router.push(`/listings/${listing.id}?updated=1`);
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
                <input className="bd-input mt-1 w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
                  <select
  className="bd-input mt-1 w-full"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">Select a categoryÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</option>
  {CATEGORY_GROUPS.map((g) => (
    <optgroup key={g.parent} label={g.parent}>
      <option value={g.parent}>{g.parent}</option>
      {g.children.map((c) => (
        <option key={c} value={joinCategory(g.parent, c)}>
          {c}
        </option>
      ))}
    </optgroup>
  ))}
</select>
                </div>

                <div>
                  <label className="text-sm font-extrabold bd-ink">Condition</label>
                  <input className="bd-input mt-1 w-full" value={condition} onChange={(e) => setCondition(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-extrabold bd-ink">Location</label>
                  <input className="bd-input mt-1 w-full" value={location} onChange={(e) => setLocation(e.target.value)} />
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

                <div className="md:col-span-2">
                  <label className="text-sm font-extrabold bd-ink">Status</label>
                  <select
                    className="bd-input mt-1 w-full"
                    value={status}
                    onChange={(e) => setStatus(normalizeStatus(e.target.value))}
                    disabled={isSaving}
                  >
                    {SELLER_ALLOWED_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 text-xs bd-ink2">Only DRAFT, ACTIVE, or ENDED are allowed for sellers.</div>
                </div>
              </div>

              {isTimedOffers ? (
                <div className="bd-card p-4">
                  <div className="text-sm font-extrabold bd-ink">Late-stage Buy Now (seller-controlled)</div>
                  <div className="mt-1 text-xs bd-ink2">
                    This is only available in the final 24 hours of a timed-offers listing, and must be above the current highest offer.
                  </div>

                  
  <div className="mt-3 flex items-center gap-2">
    <input
      id="buyNowEnabled"
      type="checkbox"
      className="h-4 w-4"
      checked={buyNowEnabled}
      onChange={(e) => setBuyNowEnabled(!!e.target.checked)}
      disabled={isSaving}
    />
    <label htmlFor="buyNowEnabled" className="text-sm font-extrabold bd-ink">
      Enable Buy Now (final 24h)
    </label>
  </div>
<div className="mt-3 grid gap-2">
                    <label className="text-sm font-extrabold bd-ink">Buy Now price (AUD)</label>
                    <input
                      className="bd-input mt-1 w-full"
                      value={buyNow}
                      onChange={(e) => setBuyNow(e.target.value)}
                      inputMode="decimal"
                      placeholder={inFinal24h ? "e.g. 250" : "Available in final 24h"}
                      disabled={isSaving || !buyNowEnabled || !inFinal24h}
                    />
                    {isTimedOffers ? (
                      <div className="text-xs bd-ink2">
                        Current highest offer:{" "}
                        <span className="font-semibold bd-ink">{new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number((listing as unknown as { highestOfferCents?: number | null }).highestOfferCents ?? 0) / 100)}</span>
                      </div>
                    ) : null}
                    {!inFinal24h ? (
                      <div className="text-xs bd-ink2">Not in the final 24h window yet.</div>
                    ) : (
                      <div className="text-xs bd-ink2">Leave blank to remove Buy Now again.</div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Photos */}
              <div className="grid gap-2">
                <div className="text-sm font-extrabold bd-ink">Photos</div>
                <div className="text-xs bd-ink2">Add, remove, or reorder photos. Max 10 total.</div>

                {existingImages.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {existingImages.map((url, idx) => (
                      <div key={url + idx} className="relative overflow-hidden rounded-xl border border-black/10 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Listing photo" className="h-28 w-full object-cover" />

                        <div className="absolute left-2 top-2 flex gap-1">
  <button
    type="button"
    className="!h-7 !w-7 !p-0 !rounded-full !bg-white !opacity-100 !text-black font-extrabold border border-black/20 shadow-sm grid place-items-center leading-none disabled:opacity-40"
    onClick={() => moveImage(idx, idx - 1)}
    disabled={idx === 0}
    aria-label="Move photo left"
    title="Move left"
  >
    ÃƒÂ¢Ã¢â‚¬Â Ã‚Â
  </button>
  <button
    type="button"
    className="!h-7 !w-7 !p-0 !rounded-full !bg-white !opacity-100 !text-black font-extrabold border border-black/20 shadow-sm grid place-items-center leading-none disabled:opacity-40"
    onClick={() => moveImage(idx, idx + 1)}
    disabled={idx === existingImages.length - 1}
    aria-label="Move photo right"
    title="Move right"
  >
    ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢
  </button>
</div>

                        <button
                          type="button"
                          className="!h-7 !w-7 !p-0 !rounded-full !bg-white !opacity-100 text-black font-extrabold border border-black/20 shadow-sm grid place-items-center leading-none"
                          onClick={() => setExistingImages((cur) => cur.filter((_, i) => i !== idx))}
                          aria-label="Remove photo"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute right-2 top-2 h-7 px-3 rounded-full bg-white text-black text-xs font-extrabold border border-black/20 shadow-sm leading-none grid place-items-center p-0">No photos yet.</div>
                )}

                <div className="grid gap-2 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="bd-btn bd-btn-primary"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isSaving || (existingImages?.length || 0) >= 10}
                    >
                      Take photo
                    </button>

                    <button
                      type="button"
                      className="bd-btn bd-btn-primary"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isSaving || (existingImages?.length || 0) >= 10}
                    >
                      Add photos
                    </button>

                    <div className="text-xs bd-ink2">{(existingImages?.length || 0)}/10 used</div>
                  </div>

                  {/* Hidden inputs (separate camera vs gallery for better Samsung behavior) */}
                  <input
                    ref={cameraInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const picked = Array.from(e.target.files || []);
                      const remaining = Math.max(0, 10 - (existingImages?.length || 0));
                      const toAdd = picked.slice(0, Math.min(1, remaining));

                      setFiles((prev) => [...prev, ...toAdd].slice(0, 10));
                      uploadAndAppend(toAdd);

                      e.currentTarget.value = "";
                    }}
                  />

                  <input
                    ref={galleryInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const picked = Array.from(e.target.files || []);
                      const remaining = Math.max(0, 10 - (existingImages?.length || 0));
                      const toAdd = picked.slice(0, remaining);

                      setFiles((prev) => [...prev, ...toAdd].slice(0, 10));
                      uploadAndAppend(toAdd);

                      e.currentTarget.value = "";
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

