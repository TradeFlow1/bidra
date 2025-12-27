"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteListingButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={busy}
        className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-60"
        onClick={async () => {
          setErr(null);
          const ok = confirm("Delete this listing? This cannot be undone.");
          if (!ok) return;

          setBusy(true);
          try {
            const res = await fetch(`/api/listings/${id}/delete`, { method: "POST" });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
              setErr(String(data?.error || `Delete failed (HTTP ${res.status})`));
              return;
            }

            router.refresh(); // re-fetch server component data
          } catch (e: any) {
            setErr(String(e?.message || e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Deleting..." : "Delete"}
      </button>

      {err ? <div className="mt-2 text-xs text-red-700 break-words">{err}</div> : null}
    </div>
  );
}