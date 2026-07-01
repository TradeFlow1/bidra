import type { Metadata } from "next";
import { MarketplaceShell, MessageLayout, TrustStrip } from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Conversation | Bidra",
  description: "Conversation shell for visual-first rebuild.",
};

export default function MessagesThreadPage({ params }: { params: { id: string } }) {
  return (
    <MarketplaceShell title="Messages" activeNav="messages">
      <TrustStrip />
      <section className="mk-panel mk-home-intro mk-home-intro-tight">
        <p className="mk-kicker">Thread</p>
        <h1>Conversation {params.id}</h1>
        <p>Listing context is pinned in the chat so decisions stay clear.</p>
      </section>
      <MessageLayout title="Conversation" />
    </MarketplaceShell>
  );
}
