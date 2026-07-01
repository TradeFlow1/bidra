import type { Metadata } from "next";
import { MarketplaceShell, SellFormLayout, TrustStrip, ActionPanel } from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Sell an item | Bidra",
  description: "Create a listing shell for the rebuilt Bidra sell flow.",
};

export default function SellNewPage() {
  return (
    <MarketplaceShell title="Sell" activeNav="sell">
      <section className="mk-panel mk-home-intro mk-home-intro-tight">
        <p className="mk-kicker">Seller workspace</p>
        <h1>Create your listing</h1>
        <p>Guided setup with compact steps designed for desktop and mobile.</p>
      </section>

      <TrustStrip />

      <div className="mk-app-grid">
        <SellFormLayout title="Create a listing" />
        <ActionPanel
          title="Seller quality"
          description="Keep photos clear, write concise details, and use in-app messages to confirm handover."
          primaryLabel="Save as draft"
          primaryHref="#"
          secondaryLabel="Preview"
          secondaryHref="#"
        />
      </div>
    </MarketplaceShell>
  );
}
