/**
 * Bidra AU Compliance:
 * We are NOT an auction platform. Auction-style auto-bidding is disabled.
 *
 * This module is kept only to satisfy existing imports while we finish Phase 4 cleanup.
 * Phase 4.2+ will rename/refactor remaining "bid" internals to "offer" semantics.
 */

export async function recomputeAuctionPrice(listingId: string) {
  return {
    ok: false as const,
    error: "NOT_SUPPORTED" as const,
    listingId,
    message: "Auction/bidding engine disabled. Bidra operates as an offer-based marketplace.",
  };
}
