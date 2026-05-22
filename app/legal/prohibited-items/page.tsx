import { LegalContentPage, LegalSection } from "@/components/public-info-page";

export default function ProhibitedItemsPage() {
  return (
    <LegalContentPage title="Prohibited Items" active="prohibited">
      <LegalSection title="1. Unsafe or illegal items">
        <p>Do not list illegal goods, stolen goods, weapons, dangerous materials or anything that could put users at risk.</p>
      </LegalSection>

      <LegalSection title="2. Restricted goods">
        <p>Some goods may be restricted by law or platform policy, including regulated products, recalled items and age-restricted goods.</p>
      </LegalSection>

      <LegalSection title="3. Misleading listings">
        <p>Listings must be accurate. Do not use fake photos, misleading prices, counterfeit branding or descriptions that hide important defects.</p>
      </LegalSection>

      <LegalSection title="4. Services and off-platform risk">
        <p>Bidra is focused on local marketplace items. Listings that create unusual safety, payment or fulfilment risk may be removed.</p>
      </LegalSection>

      <LegalSection title="5. Reporting">
        <p>If you see a prohibited listing, report it so Bidra can review and take action.</p>
      </LegalSection>
    </LegalContentPage>
  );
}
