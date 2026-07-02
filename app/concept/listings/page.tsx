import ConceptCategoryRail from "@/components/concept-marketplace/ConceptCategoryRail";
import ConceptListingGrid from "@/components/concept-marketplace/ConceptListingGrid";
import type { ConceptListing } from "@/components/concept-marketplace/ConceptListingCard";
import ConceptSearch from "@/components/concept-marketplace/ConceptSearch";
import ConceptShell from "@/components/concept-marketplace/ConceptShell";

const categories = [
  "All listings",
  "Home and Furniture",
  "Tech and Electronics",
  "Tools and DIY",
  "Cars and Parts",
  "Wanted",
];

const listings: ConceptListing[] = [
  {
    id: "b1",
    title: "Bicycle commuter setup",
    location: "Redbank Plains, QLD",
    price: "$380",
    offer: "Current offer $340",
    mode: "Timed offer",
    image: "/brand/hero-clouds.png",
  },
  {
    id: "b2",
    title: "Hand tools bundle",
    location: "Ipswich, QLD",
    price: "$80",
    mode: "Buy Now",
    image: "/brand/hero-clouds.png",
  },
  {
    id: "b3",
    title: "Outdoor storage box",
    location: "Brisbane, QLD",
    price: "$120",
    mode: "Buy Now",
    image: "/brand/hero-clouds.png",
    featured: true,
  },
  {
    id: "b4",
    title: "Kids bike 20 inch",
    location: "Toowoomba, QLD",
    price: "$95",
    offer: "Current offer $88",
    mode: "Timed offer",
    image: "/brand/hero-clouds.png",
  },
  {
    id: "b5",
    title: "Gaming monitor 27 inch",
    location: "Gold Coast, QLD",
    price: "$220",
    mode: "Buy Now",
    image: "/brand/hero-clouds.png",
  },
];

export default function ConceptListingsPage() {
  return (
    <ConceptShell title="Concept Listings" active="listings">
      <section className="cm-panel cm-command cm-command-tight">
        <p className="cm-kicker">Browse</p>
        <h1>Search and filter active listings</h1>
        <ConceptSearch placeholder="Search listings" />
      </section>

      <section className="cm-panel cm-filter-bar">
        <div className="cm-filter-grid">
          <input type="text" placeholder="Keyword" aria-label="Keyword" />
          <select defaultValue="all" aria-label="Category">
            <option value="all">All categories</option>
            <option value="home">Home and Furniture</option>
            <option value="tech">Tech and Electronics</option>
          </select>
          <select defaultValue="all" aria-label="Sale type">
            <option value="all">Buy Now and offers</option>
            <option value="buy">Buy Now only</option>
            <option value="offer">Timed offer</option>
          </select>
          <input type="text" placeholder="Location" aria-label="Location" />
        </div>
      </section>

      <ConceptCategoryRail categories={categories} />

      <div className="cm-layout-grid">
        <ConceptListingGrid title="Browse listings" subtitle="Dense, useful marketplace results" items={listings} />
        <aside className="cm-side-stack">
          <section className="cm-panel cm-side-module">
            <h3>Nearby now</h3>
            <ul className="cm-bullet-list">
              <li>Desk lamp $35 Springfield</li>
              <li>Office chair $90 Ipswich</li>
              <li>Dining table $210 Brisbane</li>
            </ul>
          </section>
          <section className="cm-panel cm-side-module">
            <h3>Popular this week</h3>
            <ul className="cm-bullet-list">
              <li>Phone accessories</li>
              <li>Kitchen appliances</li>
              <li>Outdoor furniture</li>
            </ul>
          </section>
          <section className="cm-panel cm-side-module">
            <h3>Wanted requests</h3>
            <ul className="cm-bullet-list">
              <li>Need toddler bike in Brisbane</li>
              <li>Need gym bench in Logan</li>
              <li>Need office desk in Gold Coast</li>
            </ul>
          </section>
        </aside>
      </div>
    </ConceptShell>
  );
}
