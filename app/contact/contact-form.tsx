"use client";

import { useState } from "react";
import StatusMessage from "@/components/status-message";

const SUPPORT_EMAIL = "support@bidra.com.au";

export default function ContactForm({ defaultEmail }: { defaultEmail: string }) {
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [sending, setSending] = useState(false);

  return (
    <form
      className="rounded-[28px] border border-[#D8E1F0] bg-white p-5 shadow-sm sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setNote("");
        setError("");
        setSending(true);

        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") || "").trim();
        const message = String(fd.get("message") || "").trim();
        const website = String(fd.get("website") || "").trim();

        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, message, website }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) {
            setError(typeof data?.error === "string" ? data.error : "We could not send your message. Please check your details and try again.");
            return;
          }
          (e.currentTarget as HTMLFormElement).reset();
          setNote("Message sent. We will get back to you as soon as we can.");
        } catch {
          setError("We could not send your message. Please try again shortly.");
        } finally {
          setSending(false);
        }
      }}
    >
      <h2 className="text-2xl font-black tracking-[-0.04em] text-[#07152E]">Send us a message</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#475569]">
        Include listing, order or message links where relevant. Do not send passwords or verification codes.
      </p>

      <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
        <label>Website</label>
        <input name="website" autoComplete="off" tabIndex={-1} />
      </div>

      <div className="mt-5">
        <label className="text-sm font-black text-[#07152E]">Your email</label>
        <input
          name="email"
          type="email"
          defaultValue={defaultEmail || ""}
          required
          className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#07152E] placeholder:text-[#94A3B8] outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-[#C7D2FE]"
          placeholder="name@email.com"
          autoComplete="email"
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-black text-[#07152E]">Message</label>
        <textarea
          name="message"
          required
          rows={7}
          className="mt-2 w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#07152E] placeholder:text-[#94A3B8] outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-[#C7D2FE]"
          placeholder="Tell us what happened and include any useful links."
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={sending} className="bd-btn bd-btn-primary rounded-2xl px-6 disabled:opacity-60">
          {sending ? "Sending..." : "Send message"}
        </button>
        <a className="text-sm font-black text-[#4F46E5] hover:text-[#4338CA]" href={`mailto:${SUPPORT_EMAIL}`}>
          Email {SUPPORT_EMAIL}
        </a>
      </div>

      <div className="mt-4 space-y-3">
        {note ? <StatusMessage tone="success">{note}</StatusMessage> : null}
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      </div>
    </form>
  );
}
