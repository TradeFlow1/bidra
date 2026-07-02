"use client";
import { useState } from "react";
import StatusMessage from "@/components/status-message";
export default function ThreadActions({ threadId }: {
    threadId: string;
}) {
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
        }
        catch (e: any) {
            setErrMsg(e?.message || "Delete failed");
        }
        finally {
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
        }
        catch (e: any) {
            setErrMsg(e?.message || "Report failed");
        }
        finally {
            setBusy(false);
        }
    }
    return (<div>
      <div>
        <button type="button" onClick={function () {
            setErrMsg(null);
            setOkMsg(null);
            setReportOpen(true);
        }} disabled={busy}>
          {busy ? "Working…" : "Report user"}
        </button>

        <button type="button" onClick={function () {
            setErrMsg(null);
            setOkMsg(null);
            setDeletePhrase("");
            setDeleteOpen(true);
        }} disabled={busy}>
          Delete chat
        </button>
      </div>

      {okMsg ? <StatusMessage tone="success">{okMsg}</StatusMessage> : null}
      {errMsg ? <StatusMessage tone="error">{errMsg}</StatusMessage> : null}

      {reportOpen ? (<section role="dialog" aria-modal="true" aria-labelledby="report-chat-title">
          <h2 id="report-chat-title">Report this chat</h2>
          <label>
            Briefly describe what happened
            <textarea value={reportDetails} onChange={function (e) { setReportDetails(e.target.value); }}/>
          </label>
          <div>
            <button type="button" onClick={function () { if (!busy)
            setReportOpen(false); }} disabled={busy}>
              Cancel
            </button>
            <button type="button" onClick={doReport} disabled={busy}>
              {busy ? "Submitting..." : "Submit report"}
            </button>
          </div>
        </section>) : null}

      {deleteOpen ? (<section role="dialog" aria-modal="true" aria-labelledby="delete-chat-title">
          <h2 id="delete-chat-title">Delete this chat?</h2>
          <div>
            <p>This removes the chat from your inbox.</p>
            <label>
              Type DELETE to confirm
              <input value={deletePhrase} onChange={function (e) { setDeletePhrase(e.target.value); }}/>
            </label>
          </div>
          <div>
            <button type="button" onClick={function () { if (!busy)
            setDeleteOpen(false); }} disabled={busy}>
              Keep chat
            </button>
            <button type="button" onClick={doDelete} disabled={busy}>
              {busy ? "Deleting..." : "Delete chat"}
            </button>
          </div>
        </section>) : null}
    </div>);
}
