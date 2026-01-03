export default function Page() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[var(--bidra-bg)] text-[var(--bidra-fg)] px-4 py-10"><div className="mx-auto w-full max-w-3xl"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-white/80">
        Bidra collects the information required to operate the marketplace — such as account email, listings,
        messages, and transaction records. We aim to minimise data collection and protect user privacy.
      </p>
      <h2 className="mt-6 text-xl font-extrabold">What we store</h2>
      <ul className="mt-3 list-disc pl-6 text-sm text-white/80">
        <li>Account details (email, password hash, role, optional profile fields)</li>
        <li>Listings, offers, watchlist items, messages, reports, and order records</li>
      </ul>
      <h2 className="mt-6 text-xl font-extrabold">Payments</h2>
      <p className="mt-3 text-sm text-white/80">
        Payments are processed by Stripe. Bidra stores Stripe session identifiers for reconciliation.
      </p>
      <h2 className="mt-6 text-xl font-extrabold">Security</h2>
      <p className="mt-3 text-sm text-white/80">
        No system is perfect — if you suspect unauthorised access, change your password and contact support.
      </p>
    </div></div></main>
  );
}
