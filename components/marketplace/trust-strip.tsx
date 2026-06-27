const TRUST_ITEMS = [
  "Australia-only marketplace",
  "Highest offer, not bids",
  "Seller chooses when to accept",
  "Messages and order records kept together",
];

export function TrustStrip() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TRUST_ITEMS.map((item) => (
        <div key={item} className="rounded-[20px] border border-[var(--bd-border)] bg-white px-4 py-4 text-sm font-extrabold text-[var(--bd-ink)] shadow-[0_12px_32px_rgba(18,7,36,0.05)]">
          {item}
        </div>
      ))}
    </section>
  );
}
