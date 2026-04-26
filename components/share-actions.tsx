"use client";

import { useState } from "react";

type ShareActionsProps = {
  url: string;
  title?: string;
  text?: string;
  label?: string;
  description?: string;
};

export default function ShareActions({ url, title, text, label = "Share listing", description = "Send this listing to someone who might be interested." }: ShareActionsProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function handleCopy() {
    let copiedOk = false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        copiedOk = true;
      } else if (typeof document !== "undefined") {
        const input = document.createElement("textarea");
        input.value = url;
        input.setAttribute("readonly", "");
        input.style.position = "absolute";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        copiedOk = document.execCommand("copy");
        document.body.removeChild(input);
      }
    } catch {
      copiedOk = false;
    }

    setCopyState(copiedOk ? "copied" : "failed");
    if (typeof window !== "undefined") {
      window.setTimeout(() => setCopyState("idle"), 1600);
    }
  }

  async function handleShare() {
    if (!canShare) return;
    try {
      await navigator.share({ url, title, text });
    } catch {
    }
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white/80 p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">{label}</div>
      <p className="mt-1 text-sm text-[#64748B]">{description}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {canShare ? (
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:bg-white"
          >
            Share
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:bg-white"
        >
          {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
