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
    <div className="mb-7 overflow-hidden rounded-[32px] border border-[#E8E2F4] bg-[radial-gradient(580px_250px_at_90%_-60px,rgba(124,58,237,0.16),transparent_72%),linear-gradient(135deg,#FFFFFF_0%,#FBFAFF_58%,#F5F3FF_100%)] p-6 shadow-[0_22px_80px_rgba(18,7,36,0.09)] lg:flex lg:items-end lg:justify-between lg:gap-8">
      <div>
        <div className="inline-flex items-center rounded-full border border-[#DDD6FE] bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#7C3AED] shadow-sm">Premium browse</div>
        <h1 className="mt-3 text-4xl font-black leading-[0.96] tracking-[-0.06em] text-[#120724] sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#62516F]">{count} active listings across Australia, curated for buyers who want a premium and transparent buying experience.</p>
        {selectedQuery ? <p className="mt-2 text-sm font-black text-[#5B21B6]">Search: {selectedQuery}</p> : null}
        {radiusMessage ? <p className="mt-1 text-sm font-black text-[#5B21B6]">{radiusMessage}</p> : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:mt-0 lg:w-[430px]">
        <div className="rounded-[18px] border border-[#E8E2F4] bg-white px-3 py-3 text-center shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Type</div>
          <div className="mt-1 text-xs font-black text-[#120724]">Buy / Auction</div>
        </div>
        <div className="rounded-[18px] border border-[#E8E2F4] bg-white px-3 py-3 text-center shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Area</div>
          <div className="mt-1 text-xs font-black text-[#120724]">Australia</div>
        </div>
        <div className="rounded-[18px] border border-[#E8E2F4] bg-white px-3 py-3 text-center shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Filters</div>
          <div className="mt-1 text-xs font-black text-[#120724]">Share URL</div>
        </div>
      </div>
    </div>
  );
}
