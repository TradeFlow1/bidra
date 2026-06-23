import Link from "next/link";

type MapListing = {
  id: string;
  title: string;
  location: string;
  category: string;
  price: number;
  buyNowPrice?: number | null;
  type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

function formatPrice(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return "$" + (value / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function mapPointStyle(listing: MapListing, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
  const lat = typeof listing.latitude === "number" ? listing.latitude : null;
  const lng = typeof listing.longitude === "number" ? listing.longitude : null;
  if (lat === null || lng === null) return null;

  const latRange = Math.max(0.001, bounds.maxLat - bounds.minLat);
  const lngRange = Math.max(0.001, bounds.maxLng - bounds.minLng);
  const left = Math.max(4, Math.min(96, ((lng - bounds.minLng) / lngRange) * 100));
  const top = Math.max(4, Math.min(96, (1 - (lat - bounds.minLat) / latRange) * 100));

  return { left: `${left}%`, top: `${top}%` };
}

export default function ListingsMapPanel({ listings }: { listings: MapListing[] }) {
  const mappedListings = listings.filter((listing) => typeof listing.latitude === "number" && typeof listing.longitude === "number");
  const fallbackLocations = listings
    .filter((listing) => !(typeof listing.latitude === "number" && typeof listing.longitude === "number"))
    .slice(0, 8);

  const bounds = mappedListings.length
    ? {
        minLat: Math.min(...mappedListings.map((listing) => Number(listing.latitude))),
        maxLat: Math.max(...mappedListings.map((listing) => Number(listing.latitude))),
        minLng: Math.min(...mappedListings.map((listing) => Number(listing.longitude))),
        maxLng: Math.max(...mappedListings.map((listing) => Number(listing.longitude))),
      }
    : null;

  return (
    <section className="rounded-[32px] border border-[#D8E6F8] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4F46E5]">Map and list</div>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.045em] text-[#07152E]">Browse by area</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#526173]">Map pins use seller-provided listing location data where available. Open the listing to ask questions or arrange handover in Bidra Messages.</p>
        </div>
        <Link href="/listings" className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-4 text-sm font-black text-[#4F46E5]">List view</Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-[#C7D2FE] bg-[radial-gradient(circle_at_20%_20%,#DBEAFE_0,transparent_26%),radial-gradient(circle_at_80%_35%,#EEF2FF_0,transparent_28%),linear-gradient(135deg,#F8FAFF,#FFFFFF)]">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#CBD5E1_1px,transparent_1px),linear-gradient(90deg,#CBD5E1_1px,transparent_1px)] [background-size:48px_48px]" />
          {bounds && mappedListings.length ? (
            mappedListings.slice(0, 40).map((listing, index) => {
              const style = mapPointStyle(listing, bounds);
              if (!style) return null;
              const displayPrice = listing.type === "OFFERABLE" ? listing.price : (listing.buyNowPrice ?? listing.price);
              return (
                <Link key={listing.id} href={`/listings/${listing.id}`} style={style} className="group absolute z-10 -translate-x-1/2 -translate-y-1/2">
                  <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#4F46E5] text-xs font-black text-white shadow-[0_12px_30px_rgba(79,70,229,0.30)]">{index + 1}</span>
                  <span className="pointer-events-none absolute left-1/2 top-11 hidden w-52 -translate-x-1/2 rounded-2xl border border-[#D8E6F8] bg-white p-3 text-left shadow-xl group-hover:block">
                    <span className="line-clamp-2 text-sm font-black text-[#07152E]">{listing.title}</span>
                    <span className="mt-1 block text-xs font-bold text-[#64748B]">{listing.location}</span>
                    <span className="mt-1 block text-sm font-black text-[#4F46E5]">{formatPrice(displayPrice)}</span>
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div className="max-w-sm rounded-[28px] border border-[#D8E6F8] bg-white/95 p-5 shadow-sm">
                <div className="text-lg font-black text-[#07152E]">No precise map pins yet</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#526173]">Listings without coordinates still appear in the location list. Add suburb, state and postcode filters to narrow results.</p>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-[28px] border border-[#D8E6F8] bg-[#F8FAFF] p-4">
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-black text-[#07152E]">Nearby results</h3><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#4F46E5]">{listings.length}</span></div>
          <div className="mt-3 space-y-2">
            {listings.slice(0, 10).map((listing, index) => {
              const displayPrice = listing.type === "OFFERABLE" ? listing.price : (listing.buyNowPrice ?? listing.price);
              return (
                <Link key={listing.id} href={`/listings/${listing.id}`} className="flex gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm hover:border-[#C7D2FE]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#EEF2FF] text-xs font-black text-[#4F46E5]">{index + 1}</span>
                  <span className="min-w-0"><span className="line-clamp-2 text-sm font-black text-[#07152E]">{listing.title}</span><span className="mt-1 block truncate text-xs font-bold text-[#64748B]">{listing.location}</span><span className="mt-1 block text-xs font-black text-[#4F46E5]">{formatPrice(displayPrice)}</span></span>
                </Link>
              );
            })}
          </div>
          {fallbackLocations.length ? <p className="mt-3 text-xs font-semibold leading-5 text-[#64748B]">Some results use text-only locations until precise coordinates are available.</p> : null}
        </aside>
      </div>
    </section>
  );
}
