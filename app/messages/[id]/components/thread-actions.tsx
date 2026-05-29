"use client";

import { useState } from "react";
import BdModal from "@/components/bd-modal";
import StatusMessage from "@/components/status-message";

export default function ThreadActions({ threadId }: { threadId: string }) {
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDetails, setReportDetails] = useState("");

  async function doDelete() {
    setOkMsg(null);
    setErrMsg(null);

    if (deletePhrase.trim().toUpperCase() !== "DELETE") {
      setErrMsg("Type DELETE to confirm chat deletion.");
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(`/api/messages/thread/${threadId}/delete`, { method: "POST" });
      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrMsg(j.error || "Delete failed");
        return;
      }

      window.location.href = "/messages";
    } catch (e: any) {
      setErrMsg(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function doReport() {
    setOkMsg(null);
    setErrMsg(null);

    const details = reportDetails.trim();
    if (!details) {
      setErrMsg("Briefly describe what happened before submitting a report.");
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(`/api/messages/thread/${threadId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details }),
      });
      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrMsg(j.error || "Report failed");
        return;
      }

      setReportOpen(false);
      setReportDetails("");
      setOkMsg("Report submitted. Thanks — we'll review it.");
    } catch (e: any) {
      setErrMsg(e?.message || "Report failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={function () {
            setErrMsg(null);
            setOkMsg(null);
            setReportOpen(true);
          }}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--bidra-ink)] hover:bg-white/10 disabled:opacity-50"
        >
          {busy ? "Working…" : "Report user"}
        </button>

        <button
          type="button"
          onClick={function () {
            setErrMsg(null);
            setOkMsg(null);
            setDeletePhrase("");
            setDeleteOpen(true);
          }}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--bidra-ink)] hover:bg-white/10 disabled:opacity-50"
        >
          Delete chat
        </button>
      </div>

      {okMsg ? <StatusMessage tone="success">{okMsg}</StatusMessage> : null}
      {errMsg ? <StatusMessage tone="error">{errMsg}</StatusMessage> : null}

      <BdModal
        open={reportOpen}
        title="Report this chat"
        onClose={function () { if (!busy) setReportOpen(false); }}
        onConfirm={doReport}
        confirmText={busy ? "Submitting..." : "Submit report"}
        cancelText="Cancel"
        confirmDisabled={busy}
      >
        <label className="grid gap-2 text-sm font-semibold bd-ink">
          Briefly describe what happened
          <textarea
            className="bd-input min-h-[120px] w-full"
            value={reportDetails}
            onChange={function (e) { setReportDetails(e.target.value); }}
          />
        </label>
      </BdModal>

      <BdModal
        open={deleteOpen}
        title="Delete this chat?"
        onClose={function () { if (!busy) setDeleteOpen(false); }}
        onConfirm={doDelete}
        confirmText={busy ? "Deleting..." : "Delete chat"}
        cancelText="Keep chat"
        confirmDisabled={busy}
      >
        <div className="space-y-3">
          <p>This removes the chat from your inbox.</p>
          <label className="grid gap-2 text-sm font-semibold bd-ink">
            Type DELETE to confirm
            <input
              className="bd-input w-full"
              value={deletePhrase}
              onChange={function (e) { setDeletePhrase(e.target.value); }}
            />
          </label>
        </div>
      </BdModal>
    </div>
  );
}
