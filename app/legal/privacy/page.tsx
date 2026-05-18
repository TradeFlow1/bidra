import { LegalContentPage, LegalSection } from "@/components/public-info-page";

export default function PrivacyPage() {
  return (
    <LegalContentPage title="Privacy Policy" active="privacy">
      <LegalSection title="1. Information we collect">
        <p>We collect the information needed to run Bidra, including account details, listing details, messages, offers and basic location information.</p>
      </LegalSection>

      <LegalSection title="2. How we use information">
        <p>We use information to provide the marketplace, show listings, support transactions, improve safety and help users manage their accounts.</p>
      </LegalSection>

      <LegalSection title="3. Location information">
        <p>Bidra may use suburb, postcode or approximate location to show nearby listings and distance filters. We do not ask users to manually enter latitude or longitude.</p>
      </LegalSection>

      <LegalSection title="4. Messages and activity">
        <p>Messages, offers and account activity may be used to support safety, moderation, dispute handling and platform improvement.</p>
      </LegalSection>

      <LegalSection title="5. Your choices">
        <p>You can update your account information and contact us if you need help with privacy questions or account changes.</p>
      </LegalSection>
    </LegalContentPage>
  );
}
