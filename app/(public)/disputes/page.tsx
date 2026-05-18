import { LegalContentPage, LegalSection } from "@/components/public-info-page";

export default function DisputesPage() {
  return (
    <LegalContentPage title="Disputes" active="disputes">
      <LegalSection title="1. Start with the other user">
        <p>If something goes wrong, contact the other user first and try to resolve it clearly and respectfully.</p>
      </LegalSection>
      <LegalSection title="2. Keep records">
        <p>Keep messages, listing details, photos and payment records. These help if a report or dispute needs review.</p>
      </LegalSection>
      <LegalSection title="3. Report serious issues">
        <p>Use Bidra reporting tools for scams, unsafe behaviour, prohibited items or policy breaches.</p>
      </LegalSection>
      <LegalSection title="4. Platform role">
        <p>Bidra can review platform activity and take account or listing action. Buyers and sellers remain responsible for payment, pickup and handover arrangements.</p>
      </LegalSection>
    </LegalContentPage>
  );
}
