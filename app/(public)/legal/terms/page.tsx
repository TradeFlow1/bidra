export default function Page() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[var(--bidra-bg)] text-[var(--bidra-fg)] px-4 py-10"><div className="mx-auto w-full max-w-3xl"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur">
      <h1 className="text-3xl font-extrabold tracking-tight">Terms</h1>
      <p className="mt-3 text-sm text-white/80">
        Bidra provides a marketplace platform that helps people list, discover, and transact with each other.
        You're responsible for your listings, communications, and compliance with local laws.
      </p>
      <h2 className="mt-6 text-xl font-extrabold">Accounts</h2>
      <ul className="mt-3 list-disc pl-6 text-sm text-white/80">
        <li>Use a valid email address and keep your login secure.</li>
        <li>Don't misrepresent identity or listing details.</li>
      </ul>
      <h2 className="mt-6 text-xl font-extrabold">Listings & transactions</h2>
      <ul className="mt-3 list-disc pl-6 text-sm text-white/80">
        <li>List only permitted items and provide accurate descriptions.</li>
        <li>Respect listing rules and honour accepted offers and buy-now purchases.</li>
        <li>Disputes are handled between buyers and sellers where possible.</li>
      </ul>
      <p className="mt-3 text-sm text-white/80">See also: Prohibited Items and Safety Tips.</p>
    </div></div></main>
  );
}
