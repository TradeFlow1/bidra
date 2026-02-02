export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-3 text-base text-black/70">
        This page explains how Bidra collects and uses personal information. We aim to minimise data collection and only
        use what’s needed to operate the marketplace, improve safety, and comply with Australian requirements.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">What we collect</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Account information (e.g. email, username, and basic profile details you choose to provide).</li>
          <li>Location information for marketplace context (suburb, state, postcode) — shown in a privacy-safe way.</li>
          <li>Activity and usage data (e.g. logs and actions taken) to prevent abuse, diagnose issues, and improve reliability.</li>
          <li>Content you create (listings, offers, feedback, reports) to operate the service and enforce rules.</li>
          <li>Messages you send through Bidra to provide messaging features and support safety investigations where needed.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">How we use information</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Provide and maintain the marketplace (listings, messaging, offers, orders, and support).</li>
          <li>Detect and prevent fraud, spam, prohibited items, and abusive behaviour.</li>
          <li>Enforce our Terms and keep the community safe.</li>
          <li>Communicate important service updates and account notices.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Sharing and disclosure</h2>
        <p className="mt-3 text-black/75">
          We do not sell personal information. We may share information with trusted service providers only where needed
          to operate Bidra (for example, hosting, email delivery, analytics, and spam prevention). We may also disclose information where
          required by law or where reasonably necessary to protect users and the platform from harm, fraud, or security incidents.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Cookies and analytics</h2>
        <p className="mt-3 text-black/75">
          Bidra uses cookies and similar technologies for essential functions (like keeping you signed in) and to help us understand how the service is used.
          Where we use analytics or anti-abuse tools, we aim to choose privacy-respecting settings and collect only what we need.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Data retention</h2>
        <p className="mt-3 text-black/75">
          We retain information only for as long as needed to operate Bidra, comply with legal obligations, respond to support requests, and resolve disputes.
          Some records may be retained for safety, fraud prevention, and audit purposes.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="mt-3 text-black/75">
          We use reasonable security measures to protect personal information. No system is perfectly secure, so please use a strong password and
          avoid sharing sensitive information in messages that you wouldn’t want exposed.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Your choices</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>You can update many profile details in Account settings.</li>
          <li>You can contact us to request access or correction of personal information, subject to verification.</li>
          <li>If you delete your account, some information may remain where required for safety, fraud prevention, or legal compliance.</li>
        </ul>
      </section>

      <section className="mt-10 text-sm text-black/60">
        <p>
          Questions? Contact us via <a className="underline" href="/contact">Contact</a>. See also{" "}
          <a className="underline" href="/legal/terms">Terms</a>.
        </p>
      </section>
    </main>
  );
}
