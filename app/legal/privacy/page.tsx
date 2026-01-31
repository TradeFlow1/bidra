export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy — Bidra",
};

function L({ children }: { children: any }) {
  return <p className="text-sm bd-ink2 leading-6">{children}</p>;
}

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm bd-ink2">
          Bidra is privacy-first. We collect the minimum information needed to run a safe Australian marketplace and to prevent abuse and fraud.
        </p>

        <div className="mt-6 rounded-xl border bd-bd bg-white p-6 space-y-6">
          <section className="space-y-2">
            <H2>1) What we collect</H2>
            <ul className="list-disc pl-6 space-y-1 text-sm bd-ink2">
              <li><strong>Account info:</strong> email, password (stored securely), username/display name.</li>
              <li><strong>18+ enforcement:</strong> date of birth used to enforce adult-only accounts.</li>
              <li><strong>General location:</strong> suburb/state/postcode (no street address required for accounts).</li>
              <li><strong>Marketplace activity:</strong> listings, offers, orders, messages, watchlist, and related actions.</li>
              <li><strong>Safety signals:</strong> reports, moderation outcomes, integrity logs, and audit events.</li>
              <li><strong>Technical data:</strong> device/browser info, basic logs, and IP address for security and abuse prevention.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>2) How we use information</H2>
            <ul className="list-disc pl-6 space-y-1 text-sm bd-ink2">
              <li>Provide core features (browse, listing, offers, messaging, orders, feedback, reporting).</li>
              <li>Keep the platform safe (spam/abuse detection, fraud prevention, enforcement and investigations).</li>
              <li>Maintain integrity logs so we can understand what happened if something goes wrong.</li>
              <li>Communicate important service messages (for example, security or account notices).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>3) What we don’t do</H2>
            <ul className="list-disc pl-6 space-y-1 text-sm bd-ink2">
              <li>We don’t sell your personal data.</li>
              <li>We don’t require street addresses for accounts.</li>
              <li>We avoid collecting sensitive information (for example: religion, political opinions, health information, or biometrics).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>4) Sharing and third parties</H2>
            <L>
              We share information only when needed to operate the service, comply with law, or protect users.
              This can include infrastructure providers (hosting, email delivery) and safety tooling.
            </L>
            <L>
              If Bidra provides a payment feature, payment processing will be handled by a licensed payment provider. Bidra will not ask you to share passwords or verification codes.
            </L>
          </section>

          <section className="space-y-2">
            <H2>5) Cookies and analytics</H2>
            <L>
              Bidra uses essential cookies/session storage for sign-in and security. We may use minimal analytics to understand performance and reliability.
              We aim to keep tracking low and focused on product quality and safety.
            </L>
          </section>

          <section className="space-y-2">
            <H2>6) Retention</H2>
            <L>
              We keep information for as long as needed to provide the service and meet legal, fraud-prevention, and safety needs.
              Some records (for example, safety and audit logs) may be retained for longer to protect users and the platform.
            </L>
          </section>

          <section className="space-y-2">
            <H2>7) Security</H2>
            <L>
              We use reasonable administrative, technical, and organisational measures to protect information.
              No system is perfectly secure, so please use a strong password and keep your account details private.
            </L>
          </section>

          <section className="space-y-2">
            <H2>8) Your choices</H2>
            <L>
              You can update account details in your profile. You may request deletion, subject to legal and safety retention requirements.
              For requests, use the Contact page.
            </L>
            <p className="text-sm">
              <a className="bd-link font-semibold" href="/contact">Contact</a>
            </p>
          </section>

          <p className="text-xs bd-ink2">
            This is a plain-language policy designed for clarity. If anything is unclear, please reach out via{" "}
            <a className="bd-link font-semibold" href="/contact">Contact</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
