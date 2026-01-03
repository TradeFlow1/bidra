import Link from "next/link";

type ListingCardListing = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  buyNowPrice?: number | null;
  type?: string;
  category?: string;
  condition?: string | null;
  images?: string[] | null;
  location?: string | null;
};

type ListingCardProps = {
  listing: ListingCardListing;
  initiallyWatched?: boolean;
};

export default function ListingCard({ listing }: ListingCardProps) {
  const image =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : "/brand/icon/bidra-icon_dark.png";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block rounded-lg overflow-hidden hover:shadow-md transition border border-white/10 bg-black/20"
    >
      <div className="aspect-[3/4] bg-gray-100 relative flex items-center justify-center">
  <img
    src={image}
    alt={listing.title}
    className="object-cover w-full h-full"
  />
  {!listing.images || listing.images.length === 0 ? (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white">
      Photos coming soon
    </div>
  ) : null}
</div>

      <div className="p-2 space-y-1">
        <h3 className="text-base font-semibold leading-snug line-clamp-2">
          {listing.title}
        </h3>

        <div className="text-sm font-bold leading-tight">
          {"A$" + listing.price.toLocaleString()}
        </div>

        {listing.location && (
          <div className="text-xs text-gray-500">
            {listing.location}
          </div>
        )}
      </div>
    </Link>
  );
}
