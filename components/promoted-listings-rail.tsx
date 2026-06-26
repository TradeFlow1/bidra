import Link from "next/link";
import { promotedPlacementDisclosure } from "@/lib/featured-listings";
import { ProductPlaceholder, placeholderKindFromCategory } from "@/components/marketplace-ui";

type PromotedListing = {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  buyNowPrice?: number | null;
  type?: string | null;
  images?: string[] | null;
  seller?: { username?: string | null; name?: string | null } | null;
};

function formatPrice(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return "$" + (value / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function firstImage(listing: PromotedListing) {
  return Array.isArray(listing.images) ? listing.images.find((item) => typeof item === "string" && item.trim()) || null : null;
}

export default function PromotedListingsRail({ listings }: { listings: PromotedListing[] }) {
  if (!listings.length) return null;

  return (
    <section className="rounded-[32px] border border-[#C7D2FE] bg-[#F8FAFF] p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4F46E5]">Promoted listings</div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#07152E] sm:text-3xl">Featured items worth a look</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#526173]">{promotedPlacementDisclosure} Open the listing to ask questions, make offers or arrange handover directly in Bidra Messages.</p>
        </div>
        <Link href="/listings" className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#C7D2FE] bg-white px-5 text-sm font-black text-[#4F46E5]">Browse all</Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {listings.slice(0, 4).map((listing) => {
          const image = firstImage(listing);
          const price = listing.type === "OFFERABLE" ? listing.price : listing.buyNowPrice ?? listing.price;
          const sellerName = listing.seller?.name || listing.seller?.username || "Seller";

          return (
            <Link key={listing.id} href={`/listings/${listing.id}`} className="group overflow-hidden rounded-[24px] border border-[#D8E6F8] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF2FF]">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                ) : (
                  <ProductPlaceholder kind={placeholderKindFromCategory(listing.category)} title="Image pending" />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#4F46E5] shadow-sm">Promoted</span>
              </div>
              <div className="p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#64748B]">{listing.category}</div>
                <h3 className="mt-1 line-clamp-2 text-base font-black leading-tight text-[#07152E]">{listing.title}</h3>
                <p className="mt-2 text-lg font-black text-[#07152E]">{formatPrice(price)}</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-[#64748B]"><span className="truncate">{listing.location}</span><span className="truncate">{sellerName}</span></div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
