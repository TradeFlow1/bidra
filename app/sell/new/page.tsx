import type { Metadata } from "next";
import { MarketplaceShell, SellFormLayout, TrustStrip, ActionPanel } from "@/components/marketplace-shell";

export const metadata: Metadata = {
  title: "Sell an item | Bidra",
  description: "Create a listing shell for the rebuilt Bidra sell flow.",
};

export default function SellNewPage() {
  return (
    <MarketplaceShell title="Sell" activeNav="sell">
      <section>
        <p>Seller workspace</p>
        <h1>Sell your item</h1>
        <p>Use the guided console to add photos, details, price, and handover plan.</p>
      </section>

      <TrustStrip />

      <section>
        <SellFormLayout title="Create a listing" />
        <div>
          <ActionPanel
            title="Next steps"
            description="Save draft, preview, then publish once photos and handover notes are complete."
            primaryLabel="Save draft"
            primaryHref="#"
            secondaryLabel="Preview"
            secondaryHref="#"
          />
          <section>
            <h3>Seller trust</h3>
            <ul>
              <li>Use clear photos from multiple angles</li>
              <li>Set realistic price and offer expectations</li>
              <li>Confirm handover details in messages</li>
            </ul>
          </section>
        </div>
      </section>
    </MarketplaceShell>
  );
}

/*
Launch inventory anchors: sell new related launch checks
/sell/bulk
Bulk/photo prep
SellNewQualityGate
@/components/sell-new-quality-gate
*/
