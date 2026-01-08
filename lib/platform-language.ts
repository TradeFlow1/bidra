export const PLATFORM_LANGUAGE = {
  timedBidding: "timed offers",
  bidHistory: "offer history",
  listingRules: "listing rules",
  enforcement: "platform enforcement",
  outcome: "outcome",
  notParty: "Bidra is not a party to the transaction.",
  noGuarantee:
    "Bidra does not guarantee authenticity, quality, or delivery. Users are responsible for their own decisions and arrangements.",
  payments:
    "Payments are handled via licensed payment providers. Bidra does not hold pooled customer funds.",
};

export function neutralCopy(parts: Array<string | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}
