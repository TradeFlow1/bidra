import { LegalContentPage, LegalSection } from "@/components/public-info-page";

export default function FeesPage() {
  return (
    <LegalContentPage title="Fees" active="fees">
      <LegalSection title="1. Listing fees">
        <p>Standard listings are free for users during Bidra V1.</p>
      </LegalSection>

      <LegalSection title="2. Buying and offers">
        <p>Buyers can browse, buy now and make offers without a Bidra platform fee during V1.</p>
      </LegalSection>

      <LegalSection title="3. Optional paid features">
        <p>Bidra may add optional paid features in the future, such as promoted listings or business tools. Any fees will be shown before purchase.</p>
      </LegalSection>

      <LegalSection title="4. Payments and handover">
        <p>Buyers and sellers arrange payment, pickup and handover directly unless a future Bidra payment feature is clearly offered.</p>
      </LegalSection>
    </LegalContentPage>
  );
}
