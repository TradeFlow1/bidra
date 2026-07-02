"use client";
import { BidraAccountShell } from "@/components/bidra/layout/BidraAccountShell";
import { BidraButton } from "@/components/bidra/ui/BidraButton";
import { BidraCard } from "@/components/bidra/ui/BidraCard";
export default function MessagesError({ reset }: {
    reset: () => void;
}) {
    return (<BidraAccountShell>
      <BidraCard>
        <h1>Messages could not load</h1>
        <p>Try again, or return to your account while we fix the inbox view.</p>
        <div>
          <BidraButton type="button" onClick={reset}>Try again</BidraButton>
          <BidraButton href="/account" variant="secondary">Back to account</BidraButton>
        </div>
      </BidraCard>
    </BidraAccountShell>);
}
