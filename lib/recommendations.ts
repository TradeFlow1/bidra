import { Prisma } from "@prisma/client";

function cleanText(value: string | null | undefined) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function topLevelCategory(value: string | null | undefined) {
  const clean = cleanText(value);
  if (!clean) return "";
  if (clean.indexOf(" > ") >= 0) return clean.split(" > ")[0] || clean;
  return clean;
}

export function getRecommendationFoundationSummary() {
  return {
    mode: "rules-based-discovery",
    categoryMatching: true,
    locationMatching: true,
    sellerFallback: true,
    latestActiveFallback: true,
    aiPersonalisation: false,
    machineLearningRanking: false,
    vectorSearch: false,
    embeddings: false,
    collaborativeFiltering: false,
    behaviouralProfiling: false,
    paidPlacement: false,
    summary: "Bidra currently uses simple rules-based discovery from active listing category, location, seller, and recency signals. AI personalisation, machine-learning ranking, vector search, behavioural profiling, and paid placement are not active yet.",
  };
}

export function getRecommendationLimitBullets() {
  return [
    "Recommendations are rules-based discovery suggestions, not AI personalisation.",
    "No machine-learning ranking, vector search, embeddings, or collaborative filtering is active.",
    "No behavioural profiling or paid placement ranking is active.",
    "Suggestions should be treated as browse shortcuts, not guarantees of relevance, price, safety, or availability.",
  ];
}

export function getRelatedListingWhere(input: {
  currentListingId: string;
  category?: string | null;
  location?: string | null;
  sellerId?: string | null;
}) {
  const category = cleanText(input.category);
  const topCategory = topLevelCategory(category);
  const location = cleanText(input.location);
  const sellerId = cleanText(input.sellerId);

  const or: Prisma.ListingWhereInput[] = [];

  if (category) {
    or.push({ category });
  }

  if (topCategory && topCategory !== category) {
    or.push({ category: { startsWith: topCategory + " > " } });
    or.push({ category: topCategory });
  }

  if (location) {
    or.push({ location: { contains: location, mode: "insensitive" } });
  }

  if (sellerId) {
    or.push({ sellerId });
  }

  const where: Prisma.ListingWhereInput = {
    id: { not: input.currentListingId },
    status: "ACTIVE",
    orders: { none: {} },
    NOT: [
      { title: { equals: "test", mode: "insensitive" } },
      { title: { startsWith: "test", mode: "insensitive" } },
      { title: { contains: "dfgh", mode: "insensitive" } },
      { title: { contains: "asdf", mode: "insensitive" } },
      { title: { contains: "qwer", mode: "insensitive" } },
      { title: { contains: "no photos", mode: "insensitive" } },
      { title: { contains: "no photo", mode: "insensitive" } },
    ],
  };

  if (or.length > 0) {
    where.OR = or;
  }

  return where;
}
