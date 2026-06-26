"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import BdModal from "@/components/bd-modal";
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


const SELLER_ALLOWED_STATUSES = ["DRAFT", "ACTIVE", "ENDED", "SOLD"] as const;
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

  // Kevin timed-offers: late-stage Buy now reveal (seller-controlled)
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
  const [endOpen, setEndOpen] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const previews = useMemo(() => {
    return files.slice(0, 10).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }, [files]);
  const reviewSaleType = isTimedOffers ? "Make an offer (timed offers)" : "Buy now";
  const reviewPrice = isTimedOffers
    ? `${price ? `$${price} current` : "Not set"}${buyNowEnabled && buyNow ? ` · Buy now $${buyNow}` : ""}`
    : (price ? `$${price}` : "Not set");

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

    // Late-stage Buy now: allow blank to clear, but validate if provided
    if (isTimedOffers) {
      const s = String(buyNow ?? "").trim();
      if (s) {
        const n = Number(s);
        if (!Number.isFinite(n)) return "Buy now must be a number.";
        if (n <= 0) return "Buy now must be greater than $0.";
      }
    }

    return null;
  }

  async function endListing() {
    if (isSaving) return;
    if (!true) return;

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

  async function markListingSold() {
    if (isSaving) return;

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
        status: "SOLD",
      };

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
        setError(String((data as unknown as { error?: string })?.error || `Mark sold failed (HTTP ${res.status})`));
        return;
      }

      setStatus("SOLD");
      router.push("/dashboard/listings");
      router.refresh();
    } catch (e: any) {
      setError(String(e?.message || e || "Mark sold failed."));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteListing() {
    if (isSaving) return;
    if (!true) return;

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
    <main className="bd-container py-4 sm:py-8">
      <div className="container max-w-3xl">
        <div className="flex flex-col gap-3">
          <section className="rounded-[24px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Seller dashboard</div>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight bd-ink sm:text-3xl">Edit listing</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs bd-ink2">
                  <span className="rounded-full border border-[#D8E1F0] bg-white px-3 py-1.5 font-semibold">Status: <span className="font-extrabold bd-ink">{status}</span></span>
                  {status === "ACTIVE" ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-extrabold text-emerald-900">Live listing</span> : null}
                </div>
              </div>

              <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
                <Link href={`/listings/${listing.id}`} className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
                  View listing
                </Link>

                <Link href="/dashboard/listings" className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
                  My listings
                </Link>

                {status === "ACTIVE" ? (
                  <button
                    type="button"
                    onClick={function () { setError(null); setEndOpen(true); }}
                    disabled={isSaving}
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    End listing
                  </button>
                ) : null}

                {status !== "SOLD" ? (
                  <button
                    type="button"
                    onClick={function () { setError(null); setSoldOpen(true); }}
                    disabled={isSaving}
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    Mark sold
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={function () { setError(null); setDeleteOpen(true); }}
                  disabled={isSaving}
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-red-200 bg-white px-5 text-sm font-extrabold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </section>
          {error ? (
            <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="text-sm font-extrabold bd-ink">Fix this first</div>
              <div className="mt-1 text-sm bd-ink2">{error}</div>
            </div>
          ) : null}

          <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-2.5 shadow-sm sm:p-4">
            <form id="editListingForm"
              className="grid gap-2.5 sm:gap-3"
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

                    // Kevin timed-offers: seller-controlled late Buy now reveal
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
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-extrabold bd-ink">Category</label>
                  <select
                    className="bd-input mt-1 w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select a category...</option>
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
                </div>
              </div>

              {isTimedOffers ? (
                <div className="rounded-[20px] border border-[#D8E1F0] bg-[#F8FAFC] p-3">
                  <div className="text-sm font-extrabold bd-ink">Buy now option</div>

                  
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
      Enable Buy now
    </label>
  </div>
<div className="mt-3 grid gap-2">
                    <label className="text-sm font-extrabold bd-ink">Buy now price (AUD)</label>
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
                        Highest offer so far:{" "}
                        <span className="font-semibold bd-ink">{new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number((listing as unknown as { highestOfferCents?: number | null }).highestOfferCents ?? 0) / 100)}</span>
                      </div>
                    ) : null}
                    {!inFinal24h ? (
                      <div className="text-xs bd-ink2">Available near the end of the listing.</div>
                    ) : (
                      <div className="text-xs bd-ink2">Clear the price to remove Buy now.</div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Photos */}
              <div className="grid gap-2">
                <div className="text-sm font-extrabold bd-ink">Photos</div>
                <div className="text-xs bd-ink2">First photo is the main image.</div>

                {existingImages.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                    {existingImages.map((url, idx) => (
                      <div key={url + idx} className="relative overflow-hidden rounded-[20px] border border-[#D8E1F0] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Listing photo" className="h-20 w-full object-cover sm:h-28" />

                        <div className="absolute left-2 top-2 flex gap-1">
                          <button
                            type="button"
                            className="!h-7 !w-7 !p-0 !rounded-full !bg-white !opacity-100 !text-black font-extrabold border border-black/20 shadow-sm grid place-items-center leading-none disabled:opacity-40"
                            onClick={() => moveImage(idx, idx - 1)}
                            disabled={idx === 0}
                            aria-label="Move photo left"
                            title="Move left"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            className="!h-7 !w-7 !p-0 !rounded-full !bg-white !opacity-100 !text-black font-extrabold border border-black/20 shadow-sm grid place-items-center leading-none disabled:opacity-40"
                            onClick={() => moveImage(idx, idx + 1)}
                            disabled={idx === existingImages.length - 1}
                            aria-label="Move photo right"
                            title="Move right"
                          >
                            ›
                          </button>
                        </div>

                        <button
                          type="button"
                          className="absolute right-1.5 top-1.5 rounded-full border border-black/20 bg-white px-2 py-1 text-[10px] font-extrabold text-black shadow-sm hover:bg-[#EEF4FF]"
                          onClick={() => setExistingImages((cur) => cur.filter((_, i) => i !== idx))}
                          aria-label="Remove photo"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold bd-ink2">Images pending.</div>
                )}

                <div className="grid gap-2 pt-1">
                  <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
                    <button
                      type="button"
                      className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isSaving || (existingImages?.length || 0) >= 10}
                    >
                      Take photo
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isSaving || (existingImages?.length || 0) >= 10}
                    >
                      Add photos
                    </button>

                    <div className="text-center text-xs bd-ink2 sm:text-left">{(existingImages?.length || 0)}/10 used</div>
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
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                      {previews.map((p) => (
                        <div key={p.url} className="overflow-hidden rounded-[20px] border border-[#D8E1F0] bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt={p.name} className="h-20 w-full object-cover sm:h-28" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <details className="rounded-[20px] border border-[#D8E1F0] bg-[#F8FAFC] p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold bd-ink [&::-webkit-details-marker]:hidden">
                  <span>Review</span>
                  <span className="text-xs font-extrabold bd-ink2">Open</span>
                </summary>
                <dl className="mt-3 grid gap-2 border-t border-[#D8E1F0] pt-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs uppercase tracking-wide bd-ink2">Title</dt><dd className="font-medium bd-ink">{title.trim() || "Not set"}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide bd-ink2">Sale type</dt><dd className="font-medium bd-ink">{reviewSaleType}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide bd-ink2">Price</dt><dd className="font-medium bd-ink">{reviewPrice}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide bd-ink2">Category</dt><dd className="font-medium bd-ink">{category || "Not set"}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide bd-ink2">Condition</dt><dd className="font-medium bd-ink">{condition || "Not set"}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide bd-ink2">Location</dt><dd className="font-medium bd-ink">{location.trim() || "Not set"}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide bd-ink2">Photos</dt><dd className="font-medium bd-ink">{(existingImages?.length || 0) + (files?.length || 0)}</dd></div>
                </dl>
              </details>

              <div className="grid gap-2 pt-1 sm:flex sm:flex-wrap">
                <button type="submit" disabled={isSaving} className="sticky bottom-20 z-20 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#0B4DFF] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0842D6] disabled:cursor-not-allowed disabled:bg-[#EEF2FF] disabled:text-[#4F5F88] disabled:shadow-none sm:static sm:w-auto">
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <Link href={`/listings/${listing.id}`} className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#4F46E5] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <BdModal
        open={endOpen}
        title="End this listing?"
        onClose={function () { if (!isSaving) setEndOpen(false); }}
        onConfirm={async function () { await endListing(); setEndOpen(false); }}
        confirmText={isSaving ? "Ending..." : "End listing"}
        cancelText="Keep active"
        confirmDisabled={isSaving}
      >
        This will stop new offers and mark the listing as ended.
      </BdModal>

      <BdModal
        open={deleteOpen}
        title="Delete this listing?"
        onClose={function () { if (!isSaving) setDeleteOpen(false); }}
        onConfirm={async function () { await deleteListing(); setDeleteOpen(false); }}
        confirmText={isSaving ? "Deleting..." : "Delete listing"}
        cancelText="Keep listing"
        confirmDisabled={isSaving}
      >
        This listing will be removed from public view.
      </BdModal>

      <BdModal
        open={soldOpen}
        title="Mark this listing as sold?"
        onClose={function () { if (!isSaving) setSoldOpen(false); }}
        onConfirm={async function () { await markListingSold(); setSoldOpen(false); }}
        confirmText={isSaving ? "Marking sold..." : "Mark sold"}
        cancelText="Keep listing"
        confirmDisabled={isSaving}
      >
        This will remove the listing from active browsing and show it as sold in your listing records.
      </BdModal>
    </main>
  );
}
