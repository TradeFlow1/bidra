export default function Page() {
  return (
    <div className="prose max-w-3xl">
      <h1>Privacy Policy</h1>
      <p>
        Bidra collects the information required to operate the marketplace — such as account email, listings,
        messages, and transaction records. We aim to minimise data collection and protect user privacy.
      </p>
      <h2>What we store</h2>
      <ul>
        <li>Account details (email, password hash, role, optional profile fields)</li>
        <li>Listings, offers, watchlist items, messages, reports, and order records</li>
      </ul>
      <h2>Payments</h2>
      <p>
        Payments are processed by Stripe. Bidra stores Stripe session identifiers for reconciliation.
      </p>
      <h2>Security</h2>
      <p>
        No system is perfect — if you suspect unauthorised access, change your password and contact support.
      </p>
    </div>
  );
}
