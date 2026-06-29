export type BrowseListing = {
  id: string;
  title: string;
  location: string | null;
  images: string[] | null;
  photos: string[] | null;
  price: number | null;
  buyNowPrice: number | null;
  type: string | null;
  condition: string | null;
  fulfillmentType: string | null;
  category: string | null;
  createdAt: Date;
  offers?: Array<{ amount: number; expiresAt: Date | null }>;
  _count?: { offers: number };
  seller?: {
    username: string | null;
    name: string | null;
    createdAt: Date | null;
    emailVerified: boolean | null;
    phoneVerified: boolean | null;
  } | null;
};