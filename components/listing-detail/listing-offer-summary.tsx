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
    <>
      <div className="flex flex-wrap gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#7C3AED]">
        <span>{category}</span>
        <span>-</span>
        <span>{listingType}</span>
        <span>-</span>
        <span>{fulfillmentLabel}</span>
      </div>

      <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.055em] text-[#120724] sm:text-5xl lg:text-[52px]">
        {title}
      </h1>

      <div className="mt-4 rounded-[28px] border border-[#DDD6FE] bg-white p-5 shadow-[0_18px_55px_rgba(43,16,85,0.08)]">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7C3AED]">
          Current marketplace price
        </div>
        <div className="mt-2 text-4xl font-black tracking-[-0.045em] text-[#120724]">
          {displayPrice}
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#62516F]">
          {listingType}. Seller acceptance applies on offers.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-base font-bold text-[#62516F]">
        <span>{location}</span>
        <span>-</span>
        <span>{status}</span>
        <span>-</span>
        <span>{viewCount} views</span>
      </div>
    </>
  );
}