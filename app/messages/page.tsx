import type { Metadata } from "next";
import { MarketplaceShell, MessageLayout, TrustStrip } from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Messages | Bidra",
  description: "Messages shell for listing-first conversations.",
};

export default function MessagesInboxPage() {
  return (
    <MarketplaceShell title="Messages" activeNav="messages">
      <TrustStrip />
      <MessageLayout title="Messages" />
    </MarketplaceShell>
  );
}
