"use client";
import { useState } from "react";
type SendState = "idle" | "sending" | "sent" | "failed";
const SEND_TIMEOUT_MS = 12000;
const QUICK_REPLIES = [
    "Is the item still available?",
    "Can I inspect it before paying?",
    "What pickup time and suburb work for you?",
    "Is postage available, and what would it cost?",
    "Would you consider an offer?",
    "I’ll keep payment and handover details in Bidra Messages."
];
function displayQuickReply(text: string) {
    return text.replace("\u00e2\u20ac\u2122", "'");
}
function errorMessage(value: unknown) {
    if (value instanceof Error && value.name === "AbortError") {
        return "Message send timed out. Check your connection and try again.";
    }
    if (value instanceof Error && value.message) {
        return value.message;
    }
    return "Message failed to send. Try again.";
}
export default function SendBox({ threadId }: {
    threadId: string;
}) {
    const [body, setBody] = useState("");
    const [lastDraft, setLastDraft] = useState("");
    const [sendState, setSendState] = useState<SendState>("idle");
    const [err, setErr] = useState<string | null>(null);
    const busy = sendState === "sending";
    function addQuickReply(text: string) {
        if (busy)
            return;
        setBody(function (current) {
            const trimmed = current.trim();
            return trimmed ? trimmed + "\n" + text : text;
        });
        setSendState("idle");
        setErr(null);
    }
    async function send() {
        const text = body.trim();
        if (!text || busy)
            return;
        const controller = new AbortController();
        const timeoutId = window.setTimeout(function () {
            controller.abort();
        }, SEND_TIMEOUT_MS);
        setErr(null);
        setLastDraft(text);
        setSendState("sending");
        try {
            const res = await fetch(`/api/messages/thread/${threadId}/send`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ body: text }),
                signal: controller.signal,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data?.error || "Message failed to send. Try again.");
            }
            setBody("");
            setSendState("sent");
            window.dispatchEvent(new CustomEvent("bidra:message-sent"));
        }
        catch (e: unknown) {
            setErr(errorMessage(e));
            setSendState("failed");
        }
        finally {
            window.clearTimeout(timeoutId);
        }
    }
    function retry() {
        if (busy)
            return;
        if (!body.trim() && lastDraft)
            setBody(lastDraft);
        setErr(null);
        setSendState("idle");
    }
    return (<div>
      <label>Message</label>

      <div>
        {QUICK_REPLIES.map((reply) => {
            const label = displayQuickReply(reply);
            return (<button key={label} type="button" disabled={busy} onClick={() => addQuickReply(label)}>
              {label}
            </button>);
        })}
      </div>

      <textarea value={body} onChange={(e) => {
            setBody(e.target.value);
            if (sendState !== "sending") {
                setSendState("idle");
                setErr(null);
            }
        }} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
            }
        }} placeholder="Ask about the item, pickup, postage, payment expectations, or handover details..." aria-label="Message text" disabled={busy}/>

      {sendState === "sent" ? (<div role="status" aria-live="polite">
          Message sent.
        </div>) : null}

      {sendState === "failed" && err ? (<div role="alert">
          <div>{err}</div>
          <button type="button" onClick={retry}>
            Retry message
          </button>
        </div>) : null}

      <div>
        <div>
          Press <b>Enter</b> to send - <b>Shift+Enter</b> for a new line
        </div>

        <button type="button" disabled={busy || !body.trim()} onClick={send}>
          {busy ? "Sending..." : sendState === "failed" ? "Retry" : "Send"}
        </button>
      </div>
    </div>);
}
