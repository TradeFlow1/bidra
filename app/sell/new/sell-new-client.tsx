"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FULL_CATEGORIES } from "@/lib/categories";

type ListingTypeUI = "FIXED_PRICE" | "AUCTION";

function dollarsToCentsOrNull(v: string): number | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return NaN as any;
  return Math.round(n * 100);
}

export default function SellNewClient() {
  const router = useRouter();

  const [type, setType] = useState<ListingTypeUI>("FIXED_PRICE");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof FULL_CATEGORIES)[number] | "">("");
  const [condition, setCondition] = useState("USED");
  const [location, setLocation] = useState("");

  // FIXED_PRICE dollars
  const [price, setPrice] = useState("");

  // AUCTION dollars
  const [startingBid, setStartingBid] = useState("");
  const [reservePrice, setReservePrice] = useState(""); // optional
  const [buyNowPrice, setBuyNowPrice] = useState(""); // optional
  const [durationDays, setDurationDays] = useState("7");

  // Images
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState(""); // optional fallback

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isAuction = type === "AUCTION";
  const categoryOptions = useMemo(() => FULL_CATEGORIES, []);

  const previews = useMemo(() => {
    return files.slice(0, 10).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }, [files]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const t = title.trim();
    const d = description.trim();
    const loc = location.trim();

    if (t.length < 3) return setErr("Title must be at least 3 characters.");
    if (d.length < 3) return setErr("Description must be at least 3 characters.");
    if (!category) return setErr("Category is required.");
    if (!loc) return setErr("Location is required.");

    // fallback urls (optional)
    const urlsFromText = imageUrls
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 10);

    const fixedPriceCents = dollarsToCentsOrNull(price);
    const startBidCents = dollarsToCentsOrNull(startingBid);
    const reserveCents = dollarsToCentsOrNull(reservePrice);
    const buyNowCents = dollarsToCentsOrNull(buyNowPrice);

    if (!Number.isFinite(Number(durationDays))) return setErr("Duration is invalid.");

    if (!isAuction) {
      if (fixedPriceCents === null || Number.isNaN(fixedPriceCents) || fixedPriceCents <= 0) {
        return setErr("Price must be greater than 0.");
      }
    } else {
      if (startBidCents === null || Number.isNaN(startBidCents) || startBidCents <= 0) {
        return setErr("Starting offer must be greater than 0.");
      }

      if (reserveCents !== null) {
        if (Number.isNaN(reserveCents)) return setErr("Reserve must be a number or blank.");
        if (reserveCents <= 0) return setErr("Reserve must be greater than 0 (or blank).");
        if (reserveCents < startBidCents) return setErr("Reserve must be ≥ starting offer.");
      }

      if (buyNowCents !== null) {
        if (Number.isNaN(buyNowCents)) return setErr("Buy Now must be a number or blank.");
        if (buyNowCents <= 0) return setErr("Buy Now must be greater than 0 (or blank).");
        if (buyNowCents < startBidCents) return setErr("Buy Now must be ≥ starting offer.");
        if (reserveCents !== null && buyNowCents < reserveCents) return setErr("Buy Now must be ≥ reserve.");
      }
    }

    setBusy(true);
    try {
      // 1) Upload selected files (preferred)
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        const fd = new FormData();
        for (const f of files.slice(0, 10)) fd.append("files", f);

        const up = await fetch("/api/uploads/images", { method: "POST", body: fd });
        const upText = await up.text();
        let upData: any = null;
        try { upData = JSON.parse(upText); } catch { upData = null; }

        if (!up.ok) {
          const msg = (upData && upData.error) ? String(upData.error) : upText || "Image upload failed.";
          setErr(msg);
          return;
        }

        uploadedUrls = Array.isArray(upData?.urls) ? upData.urls : [];
      }

      const imagesToSend = uploadedUrls.length > 0 ? uploadedUrls : urlsFromText;

      // 2) Create listing
      const res = await fetch("/api/listings/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          title: t,
          description: d,
          category,
          condition: condition.trim(),
          location: loc,

          // cents
          price: isAuction ? null : fixedPriceCents,
          startingBid: isAuction ? startBidCents : null,

          reservePrice: isAuction ? reserveCents : null,
          buyNowPrice: isAuction ? buyNowCents : null,

          durationDays: isAuction ? Number(durationDays) : null,

          images: imagesToSend,
        }),
      });

      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = null; }

      if (!res.ok) {
        const msg = (data && data.error) ? String(data.error) : text || "Failed to create listing.";
        setErr(msg);
        return;
      }

      const id = data?.listing?.id;
      if (id) router.push(`/listings/${id}`);
      else router.push("/listings");
    } finally {
      // cleanup preview object URLs
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
<p className="mt-1 text-sm text-gray-600">
        Add the basics — title, description, category, condition, location, and pricing.
      </p>

      {err && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
      )}

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div>
          <label className="text-sm font-medium">Sale type</label>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={type}
            onChange={(e) => setType(e.target.value as ListingTypeUI)}
          >
            <option value="FIXED_PRICE">Fixed price</option>
            <option value="AUCTION">Timed bidding</option>
          </select>
          <div className="mt-1 text-xs text-gray-600">
            Timed bidding collects offers. When bidding ends, the seller chooses whether to proceed with the highest offer.
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Title</label>
          <input className="mt-1 w-full rounded-md border p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea className="mt-1 w-full rounded-md border p-2" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
          >
            <option value="">Select a category…</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Condition</label>
          <select className="mt-1 w-full rounded-md border p-2" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="NEW">New</option>
            <option value="LIKE_NEW">Like new</option>
            <option value="USED">Used</option>
            <option value="FOR_PARTS">For parts</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Location</label>
          <input className="mt-1 w-full rounded-md border p-2" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Suburb, State" />
        </div>

        {!isAuction && (
          <div>
            <label className="text-sm font-medium">Price (AUD)</label>
            <input className="mt-1 w-full rounded-md border p-2" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 60" />
          </div>
        )}

        {isAuction && (
          <>
            <div>
              <label className="text-sm font-medium">Starting offer (AUD)</label>
              <input className="mt-1 w-full rounded-md border p-2" value={startingBid} onChange={(e) => setStartingBid(e.target.value)} placeholder="e.g. 60" />
            </div>

            <div>
              <label className="text-sm font-medium">Reserve price (AUD) (optional)</label>
              <input className="mt-1 w-full rounded-md border p-2" value={reservePrice} onChange={(e) => setReservePrice(e.target.value)} placeholder="e.g. 120" />
              <div className="mt-1 text-xs text-gray-600">Must be ≥ starting offer. Leave blank for no reserve.</div>
            </div>

            <div>
              <label className="text-sm font-medium">Buy Now price (AUD) (optional)</label>
              <input className="mt-1 w-full rounded-md border p-2" value={buyNowPrice} onChange={(e) => setBuyNowPrice(e.target.value)} placeholder="e.g. 200" />
              <div className="mt-1 text-xs text-gray-600">Only shown until met/exceeded.</div>
            </div>

            <div>
              <label className="text-sm font-medium">Duration</label>
              <select className="mt-1 w-full rounded-md border p-2" value={durationDays} onChange={(e) => setDurationDays(e.target.value)}>
                <option value="3">3 days</option>
                <option value="5">5 days</option>
                <option value="7">7 days</option>
                <option value="10">10 days</option>
                <option value="14">14 days</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium">Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-1 w-full rounded-md border p-2"
            onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 10))}
          />
          <div className="mt-1 text-xs text-gray-600">Choose up to 10 images (max 8MB each).</div>

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((p) => (
                <div key={p.url} className="overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.name} className="h-24 w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <label className="text-sm font-medium">Image URLs (optional fallback)</label>
            <textarea
              className="mt-1 w-full rounded-md border p-2"
              rows={3}
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder="One URL per line (optional)"
            />
          </div>
        </div>

        <button type="submit" disabled={busy} className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60">
          {busy ? "Creating..." : "Create listing"}
        </button>
      </form>
    </div>
  );
}
