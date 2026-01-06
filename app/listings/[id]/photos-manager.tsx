"use client";

import { useMemo, useState } from "react";

function cleanUrl(input: string) {
  const s = String(input ?? "").trim();
  if (!s) return "";
  if (s.length > 500) return "";
  if (!/^https?:\/\//i.test(s)) return "";
  return s;
}

export default function PhotosManager({
  listingId,
  initialImages,
}: {
  listingId: string;
  initialImages: string[];
}) {
  const [images, setImages] = useState<string[]>(
    Array.isArray(initialImages) ? initialImages.filter(Boolean).map((x) => String(x).trim()).filter(Boolean) : []
  );

  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const count = images.length;

  const canAdd = useMemo(() => {
    const u = cleanUrl(url);
    if (!u) return false;
    if (images.includes(u)) return false;
    if (count >= 10) return false;
    return true;
  }, [url, images, count]);

  async function add() {
    setMsg("");
    const u = cleanUrl(url);
    if (!u) {
      setMsg("Enter a valid image URL (http/https).");
      return;
    }
    if (images.includes(u)) {
      setMsg("That photo is already added.");
      return;
    }
    if (images.length >= 10) {
      setMsg("Max 10 photos per listing.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(String(data?.error || `Add photo failed (HTTP ${res.status})`));
        return;
      }

      const next = Array.isArray(data?.listing?.images) ? data.listing.images : null;
      if (next) {
        setImages(next.filter(Boolean).map((x: any) => String(x).trim()).filter(Boolean));
      } else {
        // fallback (API already unshifts)
        setImages([u, ...images]);
      }
      setUrl("");
      setMsg("Photo added.");
    } catch (e: any) {
      setMsg(String(e?.message || e || "Add photo failed."));
    } finally {
      setBusy(false);
    }
  }

  async function remove(u: string) {
    setMsg("");
    const clean = cleanUrl(u);
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
        <div className="text-xs text-neutral-600">{count}/10</div>
      </div>

      <div className="mt-3 grid gap-2">
        <label className="bd-label text-xs">Add photo URL</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="bd-input w-full"
            disabled={busy}
          />
          <button
            type="button"
            onClick={add}
            disabled={busy || !canAdd}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-50 disabled:opacity-60"
          >
            {busy ? "Working..." : "Add photo"}
          </button>
        </div>
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
