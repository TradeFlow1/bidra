export const promotedPlacementDisclosure = "Promoted listings are launch-curated marketplace spots, not paid placement.";

export function getPromotedListingIds(raw = process.env.BIDRA_PROMOTED_LISTING_IDS || process.env.BIDRA_FEATURED_LISTING_IDS || "") {
  const seen = new Set<string>();
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || seen.has(item)) return false;
      seen.add(item);
      return true;
    })
    .slice(0, 12);
}

export function promotedListingSort(ids: string[]) {
  const order = new Map(ids.map((id, index) => [id, index]));
  return function sortByPromotionOrder<T extends { id: string }>(a: T, b: T) {
    return (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999);
  };
}
