import type { SellerPreview } from "./types";

type SellerCardProps = {
  seller: SellerPreview;
};

export default function SellerCard({ seller }: SellerCardProps) {
  return (
    <section>
      <p>Seller</p>
      <h2>Seller trust</h2>
      <div>
        <span aria-hidden="true">{seller.name.slice(0, 1).toUpperCase()}</span>
        <div>
          <p>{seller.name}</p>
          <p>{seller.suburb}</p>
        </div>
      </div>
      <p>Member since {seller.memberSince}</p>
      <p>Response time: {seller.response}</p>
      <p>Verified handover history</p>
    </section>
  );
}
