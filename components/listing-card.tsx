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
      className="block border rounded-lg overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <img
          src={image}
          alt={listing.title}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="p-3 space-y-1">
        <h3 className="text-base font-semibold leading-snug line-clamp-2">
          {listing.title}
        </h3>

        <div className="text-sm font-medium">
          ${listing.price.toLocaleString()}
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
