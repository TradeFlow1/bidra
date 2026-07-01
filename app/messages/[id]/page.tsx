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
      <section className="mk-panel">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mk-muted)]">Thread</p>
        <h1 className="mt-1 text-2xl font-extrabold">Conversation {params.id}</h1>
      </section>
      <MessageLayout title="Conversation" />
    </MarketplaceShell>
  );
}
