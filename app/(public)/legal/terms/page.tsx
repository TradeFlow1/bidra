export const metadata = {
  title: "Terms of Service — Bidra",
};

export default function Page() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Terms of Service</h1>

        <p className="mt-3 text-sm bd-ink2">
          Bidra provides a marketplace platform that helps people list, discover, and transact with each other.
          You're responsible for your listings, communications, and compliance with local laws.
        </p>

        <div className="mt-6 bd-card p-6">
          <h2 className="text-xl font-extrabold bd-ink">Accounts</h2>
          <ul className="mt-3 list-disc pl-6 text-sm bd-ink2 space-y-1">
            <li>Use a valid email address and keep your login secure.</li>
            <li>Don't misrepresent identity or listing details.</li>
          </ul>

          <h2 className="mt-6 text-xl font-extrabold bd-ink">Listings & transactions</h2>
          <ul className="mt-3 list-disc pl-6 text-sm bd-ink2 space-y-1">
            <li>List only permitted items and provide accurate descriptions.</li>
            <li>Respect listing rules and honour accepted offers and buy-now purchases.</li>
            <li>Disputes are handled between buyers and sellers where possible.</li>
          </ul>

          <p className="mt-4 text-sm bd-ink2">
            See also:{" "}
            <a className="bd-link font-semibold" href="/legal/prohibited-items">Prohibited Items</a>{" "}
            and{" "}
            <a className="bd-link font-semibold" href="/support">Safety Tips</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
