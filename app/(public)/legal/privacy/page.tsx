export const metadata = {
  title: "Privacy Policy — Bidra",
};

export default function Page() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Privacy Policy</h1>

        <p className="mt-3 text-sm bd-ink2">
          Bidra collects the information required to operate the marketplace — such as account email, listings,
          messages, and transaction records. We aim to minimise data collection and protect user privacy.
        </p>

        <div className="mt-6 bd-card p-6">
          <h2 className="text-xl font-extrabold bd-ink">What we store</h2>
          <ul className="mt-3 list-disc pl-6 text-sm bd-ink2 space-y-1">
            <li>Account details (email, password hash, role, optional profile fields)</li>
            <li>Listings, offers, watchlist items, messages, reports, and order records</li>
          </ul>

          <h2 className="mt-6 text-xl font-extrabold bd-ink">Payments</h2>
          <p className="mt-3 text-sm bd-ink2">
            Payments are processed by Stripe. Bidra stores Stripe session identifiers for reconciliation.
          </p>

          <h2 className="mt-6 text-xl font-extrabold bd-ink">Security</h2>
          <p className="mt-3 text-sm bd-ink2">
            No system is perfect — if you suspect unauthorised access, change your password and contact support.
          </p>

          <p className="mt-6 text-sm bd-ink2">
            Questions? Email{" "}
            <a className="bd-link font-semibold" href="mailto:support@bidra.com.au">support@bidra.com.au</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
