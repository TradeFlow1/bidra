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
    <div className="mb-7 overflow-hidden rounded-[28px] border border-[#E8E2F4] bg-[radial-gradient(520px_220px_at_88%_-70px,rgba(124,58,237,0.12),transparent_72%),linear-gradient(135deg,#FFFFFF_0%,#FBFAFF_58%,#F5F3FF_100%)] p-6 shadow-[0_20px_70px_rgba(18,7,36,0.08)] lg:flex lg:items-end lg:justify-between lg:gap-8">
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">Premium browse</div>
        <h1 className="mt-2 text-4xl font-black leading-[0.98] tracking-[-0.06em] text-[#120724] sm:text-5xl">{title}</h1>
        <p className="mt-3 text-base font-semibold text-[#62516F]">{count} active listings across Australia</p>
        {selectedQuery ? <p className="mt-1 text-sm font-black text-[#5B21B6]">Search: {selectedQuery}</p> : null}
        {radiusMessage ? <p className="mt-1 text-sm font-black text-[#5B21B6]">{radiusMessage}</p> : null}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 lg:mt-0 lg:w-[420px]">
        <div className="rounded-[16px] border border-[#E8E2F4] bg-white px-3 py-3 text-center shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Type</div>
          <div className="mt-1 text-xs font-black text-[#120724]">Buy / Auction</div>
        </div>
        <div className="rounded-[16px] border border-[#E8E2F4] bg-white px-3 py-3 text-center shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Area</div>
          <div className="mt-1 text-xs font-black text-[#120724]">Australia</div>
        </div>
        <div className="rounded-[16px] border border-[#E8E2F4] bg-white px-3 py-3 text-center shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Filters</div>
          <div className="mt-1 text-xs font-black text-[#120724]">Share URL</div>
        </div>
      </div>
    </div>
  );
}
