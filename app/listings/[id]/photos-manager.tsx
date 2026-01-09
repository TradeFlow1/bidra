"use client";

import { useState } from "react";

export default function PhotosManager({
  listingId,
  initialImages,
}: {
  listingId: string;
  initialImages: string[];
}) {
  const [images, setImages] = useState<string[]>(
    Array.isArray(initialImages)
      ? initialImages.filter(Boolean).map((x) => String(x).trim()).filter(Boolean)
      : []
  );

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function remove(u: string) {
    setMsg("");
    const clean = String(u ?? "").trim();
    if (!clean) return;

    const ok = confirm("Remove this photo?");
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: clean }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(String(data?.error || `Remove photo failed (HTTP ${res.status})`));
        return;
      }

      const next = Array.isArray(data?.listing?.images) ? data.listing.images : null;
      if (next) {
        setImages(next.filter(Boolean).map((x: any) => String(x).trim()).filter(Boolean));
      } else {
        setImages(images.filter((x) => x !== clean));
      }

      setMsg("Photo removed.");
    } catch (e: any) {
      setMsg(String(e?.message || e || "Remove photo failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bd-card p-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="font-extrabold">Photos</div>
        <div className="text-xs text-neutral-600">{images.length}/10</div>
      </div>

      <div className="mt-2 text-xs text-neutral-600">
        Photos are uploaded using Bidra&apos;s uploader. Paste-a-URL is not supported.
      </div>

      {msg ? <div className="mt-2 text-xs text-neutral-600">{msg}</div> : null}

      {images.length ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((img) => (
            <div key={img} className="rounded-xl border border-black/10 bg-white p-2">
              <div className="text-[11px] break-words text-neutral-700">{img}</div>
              <button
                type="button"
                onClick={() => remove(img)}
                disabled={busy}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-neutral-50 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 text-sm text-neutral-600">No photos yet.</div>
      )}
    </div>
  );
}
