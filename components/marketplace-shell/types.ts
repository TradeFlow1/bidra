export type ShellNavKey = "home" | "browse" | "offers" | "buy-now" | "wanted" | "sell" | "messages" | "account";

export type ListingPreview = {
  id: string;
  title: string;
  location: string;
  priceLabel: string;
  offerLabel?: string;
  image: string;
  typeLabel: "Buy Now" | "Timed offer" | "Offers open";
  featured?: boolean;
};

export type SellerPreview = {
  name: string;
  suburb: string;
  memberSince: string;
  response: string;
  avatar?: string;
};
