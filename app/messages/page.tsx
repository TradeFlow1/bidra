import type { Metadata } from "next";
import { MarketplaceShell, MessageLayout, TrustStrip } from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Messages | Bidra",
  description: "Messages shell for listing-first conversations.",
};

export default function MessagesInboxPage() {
  return (
    <MarketplaceShell title="Messages" activeNav="messages">
      <section className="mk-panel mk-home-intro mk-home-intro-tight">
        <p className="mk-kicker">Inbox</p>
        <h1>Marketplace messages</h1>
        <p>Review listing threads, exchange offers, and confirm handover details.</p>
      </section>
      <TrustStrip />
      <MessageLayout title="Messages" />
    </MarketplaceShell>
  );
}
