export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bidra | Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-black/70">
            Bidra is privacy-first. We collect the minimum information needed to operate an Australian marketplace and keep it safe.
          </p>
          <p className="text-xs text-black/50">
            Effective: {new Date().getFullYear()} • Questions or requests:{" "}
            <a className="bd-link font-semibold" href="/contact">Contact</a>
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">1) What we collect</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li><strong>Account:</strong> email, password (stored securely), username/display name.</li>
            <li><strong>18+ enforcement:</strong> date of birth (used to enforce adult-only accounts).</li>
            <li><strong>General location:</strong> suburb/state/postcode (no street address required).</li>
            <li><strong>Marketplace activity:</strong> listings, offers, orders, messages, watchlist, reports.</li>
            <li><strong>Safety logs:</strong> moderation actions and security events needed to prevent abuse.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">2) How we use it</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>Provide core features (listings, search, messaging, offers, orders).</li>
            <li>Protect users, prevent scams, and enforce prohibited items and conduct rules.</li>
            <li>Maintain integrity logs for investigations and platform safety.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">3) What we don’t do</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>No selling your personal data.</li>
            <li>No requirement to provide street address for an account.</li>
            <li>We avoid collecting sensitive categories (e.g., health, religion, political opinions, biometrics).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">4) Sharing</h2>
          <p className="text-sm text-black/70">
            We share information only when needed to operate the service, comply with law, or protect users
            (for example: responding to valid legal requests, hosting providers, security tooling).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">5) Retention and security</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>We retain data as needed for operations, fraud prevention, and legal/safety obligations.</li>
            <li>We use standard security practices such as access controls and secure storage of passwords.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">6) Your choices</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>You can update key account details in your profile.</li>
            <li>You may request deletion subject to legal and safety retention requirements.</li>
          </ul>
        </section>

        <p className="text-xs text-black/50">
          This is a plain-language policy. For questions or requests, use{" "}
          <a className="bd-link font-semibold" href="/contact">Contact</a>.
        </p>
      </div>
    </main>
  );
}
