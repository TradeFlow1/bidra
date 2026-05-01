"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  listingId: string;
  listingTitle: string;
};

export default function DeleteListingButton({ listingId, listingTitle }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/listings/" + encodeURIComponent(listingId) + "/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch((): unknown => ({}));

      if (!res.ok) {
        const msg = typeof data === "object" && data && "error" in data ? String((data as { error?: unknown }).error || "") : "";
        setError(msg || "Delete failed.");
        setPending(false);
        return;
      }

      setOpen(false);
      router.push("/dashboard/listings?ok=deleted");
      router.refresh();
    } catch {
      setError("Delete failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={function () { setOpen(true); }}
        className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-extrabold text-red-900 shadow-sm hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Delete listing
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-listing-title"
            className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 text-left shadow-[0_24px_80px_rgba(15,23,42,0.35)]"
          >
            <h2 id="delete-listing-title" className="text-2xl font-extrabold tracking-tight text-neutral-950">Delete this listing?</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              This removes <strong>{listingTitle}</strong> from your seller listings.
            </p>

            {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">{error}</div> : null}

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={function () { if (!pending) setOpen(false); }}
                disabled={pending}
                className="rounded-xl border border-black/20 bg-white px-4 py-3 text-center text-sm font-extrabold text-neutral-950 shadow-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep listing
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="rounded-xl border border-red-700 bg-red-700 px-4 py-3 text-center text-sm font-extrabold text-white shadow-sm hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Deleting..." : "Delete listing"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
