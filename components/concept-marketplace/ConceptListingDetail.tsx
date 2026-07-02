import Image from "next/image";

export default function ConceptListingDetail() {
  return (
    <section className="cm-detail-layout">
      <article className="cm-panel cm-detail-main">
        <p className="cm-mode">Featured listing</p>
        <h1>City commuter bike with lock and lights</h1>
        <p className="cm-location">Springfield, QLD</p>
        <div className="cm-price-row">
          <p className="cm-price">$420</p>
          <p className="cm-offer">Current offer $390</p>
        </div>

        <div className="cm-gallery">
          <Image src="/brand/hero-clouds.png" alt="Listing image" width={1100} height={760} unoptimized className="cm-gallery-main" />
          <Image src="/brand/hero-clouds.png" alt="Listing image" width={420} height={300} unoptimized className="cm-gallery-thumb" />
          <Image src="/brand/hero-clouds.png" alt="Listing image" width={420} height={300} unoptimized className="cm-gallery-thumb" />
        </div>

        <div className="cm-detail-specs">
          <p><strong>Condition:</strong> Excellent</p>
          <p><strong>Pickup:</strong> Evenings and weekends</p>
          <p><strong>Category:</strong> Sports and Outdoors</p>
          <p><strong>Seller response:</strong> Within 20 minutes</p>
        </div>
      </article>

      <aside className="cm-side-stack">
        <section className="cm-panel cm-action-card">
          <p className="cm-kicker">Buy or offer</p>
          <h2>Choose your action</h2>
          <p>Buy Now for immediate intent, or make an offer and wait for seller confirmation.</p>
          <div className="cm-action-row">
            <button type="button" className="cm-btn cm-btn-primary">Buy Now</button>
            <button type="button" className="cm-btn cm-btn-soft">Make an offer</button>
            <button type="button" className="cm-btn cm-btn-outline">Message seller</button>
          </div>
        </section>

        <section className="cm-panel cm-seller-card">
          <p className="cm-kicker">Seller trust</p>
          <h2>Taylor Smith</h2>
          <p className="cm-location">Springfield, QLD</p>
          <p className="cm-subhead">Member since Jan 2024</p>
          <p className="cm-subhead">Verified handover history</p>
          <span className="cm-mini-pill">Trusted local seller</span>
        </section>
      </aside>
    </section>
  );
}
