import type { SellerPreview } from "./types";

type SellerCardProps = {
  seller: SellerPreview;
};

export default function SellerCard({ seller }: SellerCardProps) {
  return (
    <section className="mk-panel mk-seller-card">
      <p className="mk-kicker">Seller</p>
      <h2>Seller trust</h2>
      <div className="mk-seller-top">
        <span className="mk-seller-avatar" aria-hidden="true">{seller.name.slice(0, 1).toUpperCase()}</span>
        <div>
          <p className="mk-seller-name">{seller.name}</p>
          <p className="mk-seller-meta">{seller.suburb}</p>
        </div>
      </div>
      <p className="mk-seller-meta">Member since {seller.memberSince}</p>
      <p className="mk-seller-meta">Response time: {seller.response}</p>
      <p className="mk-seller-badge">Verified handover history</p>
    </section>
  );
}
