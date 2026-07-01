import type { Metadata } from "next";
import { MarketplaceShell, SellFormLayout, TrustStrip, ActionPanel } from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Sell an item | Bidra",
  description: "Create a listing shell for the rebuilt Bidra sell flow.",
};

export default function SellNewPage() {
  return (
    <MarketplaceShell title="Sell" activeNav="sell">
      <TrustStrip />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
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
