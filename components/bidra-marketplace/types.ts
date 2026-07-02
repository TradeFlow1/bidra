export type BidraNavKey = "home" | "listings" | "sell" | "messages" | "account";

export type BidraListingMode = "Buy Now" | "Timed offer" | "Offers open";

export type BidraListing = {
  id: string;
  title: string;
  price: string;
  location: string;
  mode: BidraListingMode;
  offerSummary?: string;
  imageSrc: string;
  imageAlt: string;
  seller: string;
  sellerRating: string;
  featured?: boolean;
  isSaved?: boolean;
};
