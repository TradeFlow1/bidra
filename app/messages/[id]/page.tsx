import type { Metadata } from "next";
import { MarketplaceShell, MessageLayout, TrustStrip } from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Conversation | Bidra",
  description: "Conversation shell for visual-first rebuild.",
};

export default function MessagesThreadPage({ params }: { params: { id: string } }) {
  return (
    <MarketplaceShell title="Messages" activeNav="messages">
      <section className="mk-panel mk-home-intro mk-home-intro-tight">
        <p className="mk-kicker">Thread</p>
        <h1>Conversation {params.id}</h1>
        <p>Listing details stay visible while you message and confirm next steps.</p>
      </section>
      <TrustStrip />
      <MessageLayout title="Conversation" />
    </MarketplaceShell>
  );
}
