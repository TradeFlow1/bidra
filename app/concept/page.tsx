import ConceptCategoryRail from "@/components/concept-marketplace/ConceptCategoryRail";
import ConceptListingGrid from "@/components/concept-marketplace/ConceptListingGrid";
import type { ConceptListing } from "@/components/concept-marketplace/ConceptListingCard";
import ConceptSearch from "@/components/concept-marketplace/ConceptSearch";
import ConceptShell from "@/components/concept-marketplace/ConceptShell";

const categories = [
  "Home and Furniture",
  "Tech and Electronics",
  "Tools and DIY",
  "Cars and Parts",
  "Kids",
  "Fashion",
  "Garden",
  "Wanted",
];

const listings: ConceptListing[] = [
  {
    id: "c1",
    title: "City commuter bike with lock",
    location: "Springfield, QLD",
    price: "$420",
    offer: "Current offer $390",
    mode: "Timed offer",
    image: "/brand/hero-clouds.png",
    featured: true,
  },
  {
    id: "c2",
    title: "Compact 3 seat sofa",
    location: "Brisbane, QLD",
    price: "$310",
    offer: "Highest offer $270",
    mode: "Offers open",
    image: "/brand/hero-clouds.png",
  },
  {
    id: "c3",
    title: "Tool set with carry case",
    location: "Ipswich, QLD",
    price: "$85",
    mode: "Buy Now",
    image: "/brand/hero-clouds.png",
  },
  {
    id: "c4",
    title: "27 inch monitor",
    location: "Gold Coast, QLD",
    price: "$220",
    mode: "Buy Now",
    image: "/brand/hero-clouds.png",
  },
  {
    id: "c5",
    title: "Storage shelf unit",
    location: "Logan, QLD",
    price: "$110",
    offer: "Current offer $98",
    mode: "Timed offer",
    image: "/brand/hero-clouds.png",
  },
  {
    id: "c6",
    title: "Camping chair pair",
    location: "Toowoomba, QLD",
    price: "$65",
    mode: "Buy Now",
    image: "/brand/hero-clouds.png",
  },
];

export default function ConceptHomePage() {
  return (
    <ConceptShell title="Concept Home" active="home">
      <section className="cm-panel cm-command">
        <p className="cm-kicker">Next generation concept</p>
        <h1>Find, offer, Buy Now, and handover with confidence</h1>
        <ConceptSearch placeholder="Search listings across Australia" />
      </section>

      <ConceptCategoryRail categories={categories} />

      <div className="cm-layout-grid">
        <ConceptListingGrid title="Active listings" subtitle="Search-first marketplace feed" items={listings} />
        <aside className="cm-side-stack">
          <section className="cm-panel cm-action-card">
            <p className="cm-kicker">Sell fast</p>
            <h2>Ready to list today?</h2>
            <p>Create a listing in minutes and manage offers in one inbox.</p>
            <div className="cm-action-row">
              <a href="/concept/sell" className="cm-btn cm-btn-primary">Start selling</a>
              <a href="/concept/messages" className="cm-btn cm-btn-soft">Open inbox</a>
            </div>
          </section>

          <section className="cm-panel cm-trust-row" aria-label="Trust highlights">
            <p>Verified Australian members</p>
            <p>Listing-linked messaging</p>
            <p>Buy Now and offers together</p>
            <p>Safer handover confirmation</p>
          </section>
        </aside>
      </div>
    </ConceptShell>
  );
}
