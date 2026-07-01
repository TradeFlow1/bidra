export function ListingOfferSummary({
  category,
  listingType,
  fulfillmentLabel,
  title,
  displayPrice,
  location,
  status,
  viewCount,
}: {
  category: string;
  listingType: string;
  fulfillmentLabel: string;
  title: string;
  displayPrice: string;
  location: string;
  status: string;
  viewCount: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#E8E2F4] bg-white p-5 shadow-[0_18px_60px_rgba(18,7,36,0.08)] sm:p-6">
      <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#7C3AED]">
        <span className="rounded-full bg-[#F3EEFE] px-3 py-1.5">{category}</span>
        <span className="rounded-full bg-[#F3EEFE] px-3 py-1.5">{listingType}</span>
        <span className="rounded-full bg-[#F3EEFE] px-3 py-1.5">{fulfillmentLabel}</span>
      </div>

      <h1 className="mt-5 text-3xl font-black leading-[1.02] tracking-[-0.055em] text-[#120724] sm:text-4xl lg:text-[44px]">
        {title}
      </h1>

      <div className="mt-6 rounded-[22px] bg-[linear-gradient(135deg,#F7F2FF,#FFFFFF)] p-5 ring-1 ring-[#E8E2F4]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7C3AED]">Current offer</div>
            <div className="mt-1 text-4xl font-black tracking-[-0.055em] text-[#120724]">{displayPrice}</div>
          </div>
          <div className="hidden rounded-[16px] border border-[#DDD6FE] bg-white px-4 py-3 text-right shadow-sm sm:block">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Status</div>
            <div className="mt-1 text-sm font-black text-[#120724]">{status}</div>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#62516F]">
          {listingType}. Seller acceptance applies before the sale is final.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-[16px] border border-[#E8E2F4] bg-[#FBFAFF] px-3 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Location</div>
          <div className="mt-1 truncate text-xs font-black text-[#120724]">{location}</div>
        </div>
        <div className="rounded-[16px] border border-[#E8E2F4] bg-[#FBFAFF] px-3 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Views</div>
          <div className="mt-1 text-xs font-black text-[#120724]">{viewCount}</div>
        </div>
        <div className="rounded-[16px] border border-[#E8E2F4] bg-[#FBFAFF] px-3 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Sale</div>
          <div className="mt-1 truncate text-xs font-black text-[#120724]">{fulfillmentLabel}</div>
        </div>
      </div>
    </div>
  );
}
