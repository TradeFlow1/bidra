"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "support@bidra.com.au";

export default function ContactForm({ defaultEmail }: { defaultEmail: string }) {
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  return (
    <form
      className="rounded-2xl border bd-bd bg-white p-5 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setNote("");
        setError("");

        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") || "").trim();
        const message = String(fd.get("message") || "").trim();

        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, message }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) {
            setError("We could not send your message. Please check your details and try again.");
            return;
          }
          (e.currentTarget as HTMLFormElement).reset();
          setNote("Message sent. We’ll get back to you as soon as we can.");
        } catch {
          setError("We could not send your message. Please try again shortly.");
        }
      }}
    >
      <div className="text-sm font-extrabold bd-ink">Contact Bidra Support</div>

      <div className="text-xs bd-ink2">
        Prefer email?{" "}
        <a className="bd-link font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
      </div>

      <div className="grid gap-2">
        <label className="text-sm bd-ink2">Your email</label>
        <input
          name="email"
          type="email"
          defaultValue={defaultEmail || ""}
          required
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[15px] text-[#0b1220] placeholder:text-black/40 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
          placeholder="name@email.com"
          autoComplete="email"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm bd-ink2">Message</label>
        <textarea
          name="message"
          required
          rows={6}
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[15px] text-[#0b1220] placeholder:text-black/40 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
          placeholder="Tell us what happened and include any links (listing / order / thread). Never share passwords or verification codes."
        />
      </div>

      <button type="submit" className="inline-flex w-fit rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">
        Send message
      </button>

      {note ? <div className="text-sm text-green-700 break-words">{note}</div> : null}
      {error ? <div className="text-sm text-red-700 break-words">{error}</div> : null}
    </form>
  );
}
