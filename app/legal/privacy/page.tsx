export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bidra | Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Privacy Policy</h1>

        <p className="text-sm text-black/70">
          Bidra is privacy-first. We collect the minimum information needed to run an Australian
          marketplace and keep it safe.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">1) What we collect</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>Account info: email, password (stored securely), username/display name.</li>
            <li>18+ enforcement: date of birth (used to enforce adult-only accounts).</li>
            <li>General location: postcode or suburb + state (no street address required).</li>
            <li>Platform activity: listings, offers, messages, reports, and safety logs.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">2) How we use it</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>Provide core marketplace features (listings, messaging, reporting).</li>
            <li>Enforce safety rules, prohibited items, and abuse prevention.</li>
            <li>Maintain integrity logs for moderation and investigations.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">3) What we don’t do</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>No selling your personal data.</li>
            <li>We don’t collect sensitive information (for example: religion, political opinions, health information, or biometrics).</li>
            <li>No street address requirement for accounts.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">4) Sharing</h2>
          <p className="text-sm text-black/70">
            We share information only when needed to operate the service, comply with law, or
            protect users (for example, responding to valid legal requests).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">5) Your choices</h2>
          <p className="text-sm text-black/70">
            You can update your account details in your profile. You may request deletion subject to
            legal and safety retention requirements.
          </p>
        </section>

        <p className="text-xs text-black/50">
          This is a plain-language policy. For questions or requests, use the <a className="bd-link font-semibold" href="/contact">Contact page</a>.
        </p>
      </div>
    </main>
  );
}
