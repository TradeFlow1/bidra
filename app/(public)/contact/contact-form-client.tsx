"use client";

import { useState } from "react";
import { Card, Input, Textarea, Button } from "@/components/ui";

export default function ContactFormClient({ defaultEmail }: { defaultEmail: string }) {
  const [sent, setSent] = useState(false);

  return (
    <Card>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get("email") || "").trim();
          const message = String(fd.get("message") || "").trim();

          setSent(false);

          const r = await fetch("/api/contact", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, message }),
          });

          const data = await r.json().catch((): unknown => ({}));
          if (!r.ok || !(data as any)?.ok) {
            alert(String((data as any)?.error || "Failed to send message."));
            return;
          }

          setSent(true);
          (e.currentTarget as HTMLFormElement).reset();
        }}
        className="flex flex-col gap-3"
      >
        <label className="text-sm">Your email</label>
        <Input name="email" type="email" required defaultValue={defaultEmail} />

        <label className="text-sm">Message</label>
        <Textarea name="message" required />

        <Button type="submit" className="bg-black text-white border-black hover:opacity-90">
          Send
        </Button>

        {sent ? (
          <div className="text-sm text-green-700">
            Message sent. We’ll reply to your email as soon as we can.
          </div>
        ) : null}
      </form>
    </Card>
  );
}
