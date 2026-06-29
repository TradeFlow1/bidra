export function BrowseHeader({
  title = "All listings",
  count,
  selectedQuery,
  radiusMessage,
}: {
  title?: string;
  count: number;
  selectedQuery?: string;
  radiusMessage?: string;
}) {
  return (
    <div className="mb-7 flex items-start justify-between gap-6">
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bd-purple)]">Premium browse</div>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[var(--bd-ink)]">{title}</h1>
        <p className="mt-2 text-base font-semibold text-[var(--bd-muted)]">{count} active listings across Australia</p>
        {selectedQuery ? <p className="mt-1 text-sm font-semibold text-[var(--bd-purple-dark)]">Search: {selectedQuery}</p> : null}
        {radiusMessage ? <p className="mt-1 text-sm font-semibold text-[var(--bd-purple-dark)]">{radiusMessage}</p> : null}
      </div>

      <div className="hidden h-12 items-center justify-center rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-purple-soft)] px-5 text-sm font-black text-[var(--bd-purple-dark)] shadow-sm lg:inline-flex">
        Share filters from URL
      </div>
    </div>
  );
}