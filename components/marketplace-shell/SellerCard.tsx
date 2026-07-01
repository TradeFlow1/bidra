import type { SellerPreview } from "./types";

type SellerCardProps = {
  seller: SellerPreview;
};

export default function SellerCard({ seller }: SellerCardProps) {
  return (
    <section className="mk-panel mk-seller-card">
      <h2>Seller profile</h2>
      <p className="mk-seller-name">{seller.name}</p>
      <p className="mk-seller-meta">{seller.suburb}</p>
      <p className="mk-seller-meta">Member since {seller.memberSince}</p>
      <p className="mk-seller-meta">Response time: {seller.response}</p>
    </section>
  );
}
