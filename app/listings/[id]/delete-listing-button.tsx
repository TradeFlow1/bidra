"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusMessage from "@/components/status-message";
export default function DeleteListingButton({ id }: {
    id: string;
}) {
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
        }
        catch (e: any) {
            setErr(String(e?.message || e));
        }
        finally {
            setBusy(false);
        }
    }
    return (<div>
      <button type="button" disabled={busy} onClick={function () {
            setErr(null);
            setOpen(true);
        }}>
        {busy ? "Deleting..." : "Delete"}
      </button>

      {err ? <StatusMessage tone="error">{err}</StatusMessage> : null}

            {open ? (<section role="dialog" aria-modal="true" aria-labelledby="delete-listing-title">
                    <h2 id="delete-listing-title">Delete listing?</h2>
                    <p>This cannot be undone.</p>
                    <div>
                        <button type="button" onClick={function () { if (!busy)
                        setOpen(false); }} disabled={busy}>
                            Keep listing
                        </button>
                        <button type="button" onClick={doDelete} disabled={busy}>
                            {busy ? "Deleting..." : "Delete listing"}
                        </button>
                    </div>
                </section>) : null}
    </div>);
}
