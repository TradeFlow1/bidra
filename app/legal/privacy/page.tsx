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
          <li>Account information (e.g. email, name/username, and basic profile details you choose to provide).</li>
          <li>Location information for marketplace context (suburb, state, postcode) — shown in a privacy-safe way.</li>
          <li>Activity and usage data (e.g. device/browser info, logs, and actions taken on the site) to help prevent abuse and diagnose issues.</li>
          <li>Messages and content you create (listings, offers, feedback, reports) to operate the service and enforce rules.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">How we use information</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Provide and improve the marketplace (listings, messaging, orders, and support).</li>
          <li>Detect and prevent fraud, spam, and prohibited content.</li>
          <li>Enforce our Terms and keep the community safe.</li>
          <li>Communicate important service updates and account notices.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Sharing and disclosure</h2>
        <p className="mt-3 text-black/75">
          We do not sell personal information. We may share information with trusted service providers only where needed
          to operate Bidra (for example, hosting, analytics, spam prevention). We may also disclose information where
          required by law or to protect users and the platform from harm.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Data retention</h2>
        <p className="mt-3 text-black/75">
          We retain information only for as long as needed to operate Bidra, comply with legal obligations, and resolve disputes.
          Some records may be retained for safety and audit purposes.
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
          Questions? Contact us via <a className="underline" href="/contact">Contact</a>.
        </p>
      </section>
    </main>
  );
}
