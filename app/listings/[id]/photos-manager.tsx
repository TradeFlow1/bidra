"use client";

import { useState } from "react";

export default function PhotosManager({
  listingId,
  initialImages,
}: {
  listingId: string;
  initialImages: string[];
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const images = Array.isArray(initialImages) ? initialImages : [];

  async function add() {
    setMsg("");
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) {
      setMsg("Enter a valid image URL (http/https).");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || "Add photo failed.");
        return;
      }
      window.location.reload();
    } catch {
      setMsg("Add photo failed.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(u: string) {
    setMsg("");
    try {
      setLoading(true);
      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || "Remove photo failed.");
        return;
      }
      window.location.reload();
    } catch {
      setMsg("Remove photo failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bd-card p-4 space-y-3">
      <div className="text-sm font-extrabold">Manage photos</div>

      <div className="text-xs text-neutral-600">
        Paste image URLs (http/https). Max 10 photos.
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="bd-input"
        />
        <button
          type="button"
          onClick={add}
          disabled={loading}
          className="bd-btn"
        >
          {loading ? "Working..." : "Add photo"}
        </button>
      </div>

      {msg ? <div className="text-xs text-neutral-600">{msg}</div> : null}

      {images.length ? (
        <div className="space-y-2">
          {images.map((u) => (
            <div key={u} className="flex items-center justify-between gap-3">
              <a href={u} target="_blank" rel="noreferrer" className="bd-link text-xs truncate">
                {u}
              </a>
              <button
                type="button"
                onClick={() => remove(u)}
                disabled={loading}
                className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-neutral-600">No photos yet.</div>
      )}
    </div>
  );
}
