"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BdModal from "@/components/bd-modal";
import StatusMessage from "@/components/status-message";

export default function DeleteListingButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function doDelete() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${id}/delete`, { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(String(data?.error || `Delete failed (HTTP ${res.status})`));
        return;
      }

      setOpen(false);
      router.push("/listings");
      router.refresh();
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={busy}
        className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-60"
        onClick={function () {
          setErr(null);
          setOpen(true);
        }}
      >
        {busy ? "Deleting..." : "Delete"}
      </button>

      {err ? <StatusMessage tone="error" className="mt-2 text-xs">{err}</StatusMessage> : null}

      <BdModal
        open={open}
        title="Delete listing?"
        onClose={function () { if (!busy) setOpen(false); }}
        onConfirm={doDelete}
        confirmText={busy ? "Deleting..." : "Delete listing"}
        cancelText="Keep listing"
        confirmDisabled={busy}
      >
        This cannot be undone.
      </BdModal>
    </div>
  );
}
