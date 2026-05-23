"use client";

import { BidraAccountShell } from "@/components/bidra/layout/BidraAccountShell";
import { BidraButton } from "@/components/bidra/ui/BidraButton";
import { BidraCard } from "@/components/bidra/ui/BidraCard";

export default function MessagesError({ reset }: { reset: () => void }) {
  return (
    <BidraAccountShell>
      <BidraCard className="p-6">
        <h1 className="text-2xl font-black text-[#0F172A]">Messages could not load</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#475569]">Try again, or return to your account while we fix the inbox view.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <BidraButton type="button" onClick={reset}>Try again</BidraButton>
          <BidraButton href="/account" variant="secondary">Back to account</BidraButton>
        </div>
      </BidraCard>
    </BidraAccountShell>
  );
}