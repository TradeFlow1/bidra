import { LegalContentPage, LegalSection } from "@/components/public-info-page";

export default function TermsPage() {
  return (
    <>
      <LegalContentPage title="Terms of Use" active="terms">
        <LegalSection title="1. Introduction">
          <p>Welcome to Bidra. By using our marketplace platform, you agree to these Terms of Use.</p>
        </LegalSection>

        <LegalSection title="2. Using Bidra">
          <p>You agree to use Bidra only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the service.</p>
        </LegalSection>

        <LegalSection title="3. Buying and selling">
          <p>Transactions on Bidra are between independent users. Bidra helps users connect, but buyers and sellers arrange payment, pickup and handover directly.</p>
        </LegalSection>

        <LegalSection title="4. Fees">
          <p>Bidra is free to use. We may introduce optional paid services in the future.</p>
        </LegalSection>

        <LegalSection title="5. Limitation of liability">
          <p>Bidra&apos;s liability is limited to the extent allowed by law. We are not responsible for indirect, consequential or incidental losses arising from use of the platform.</p>
        </LegalSection>

        <LegalSection title="6. Changes to terms">
          <p>We may update these terms from time to time. We&apos;ll post updates and the effective date so changes are clear to users.</p>
        </LegalSection>
      </LegalContentPage>
    </>
  );
}
