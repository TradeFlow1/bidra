"use client";

import { useState } from "react";
import { Card, Input, Textarea, Button } from "@/components/ui";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Contact</h1>
      <p className="text-neutral-700">
        Messages are sent to Bidra support. If you don’t hear back, please email support from the Support page.
      </p>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            console.log("[Bidra Contact]", Object.fromEntries(fd.entries()));
            setSent(true);
            (e.currentTarget as HTMLFormElement).reset();
          }}
          className="flex flex-col gap-3"
        >
          <label className="text-sm">Your email</label>
          <Input name="email" type="email" required />
          <label className="text-sm">Message</label>
          <Textarea name="message" required />
          <Button type="submit" className="bg-black text-white border-black hover:opacity-90">Send</Button>
          {sent ? <div className="text-sm text-green-700">Message sent. We’ll reply to your email as soon as we can.</div> : null}
        </form>
      </Card>
    </div>
  );
}
