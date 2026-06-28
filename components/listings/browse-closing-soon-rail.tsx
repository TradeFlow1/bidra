import type { BrowseListing } from "./listing-types";
import { BrowseListingCard } from "./browse-listing-card";

function hasActiveOfferWindow(listing: BrowseListing) {
  const expiresAt = listing.offers?.[0]?.expiresAt;
  if (!expiresAt) return false;

  const end = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(end.getTime())) return false;

  return end.getTime() > Date.now();
}

export function BrowseClosingSoonRail({ listings }: { listings: BrowseListing[] }) {
  const closingSoon = listings
    .filter((listing) => listing.type === "OFFERABLE" && hasActiveOfferWindow(listing))
    .slice(0, 4);

  if (!closingSoon.length) return null;

  return (
    <section className="mb-6 rounded-[28px] border border-[var(--bd-border)] bg-[linear-gradient(135deg,#180B2F_0%,#2B1055_58%,#4C1D95_100%)] p-4 text-white shadow-[0_24px_80px_rgba(43,16,85,0.18)]">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C4B5FD]">Closing soon</p>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.055em] text-white">Offer listings ending soon</h2>
        </div>
        <p className="hidden text-sm font-bold text-white/70 sm:block">Seller acceptance still applies</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {closingSoon.map((listing) => (
          <BrowseListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}