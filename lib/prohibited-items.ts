export type ProhibitedMatch = {
  blocked: boolean;
  category?: "NICOTINE_VAPE" | "ALCOHOL" | "SEXUAL_FETISH";
  evidence?: string[];
};

function norm(s: any): string {
  return String(s ?? "").toLowerCase();
}

export function checkProhibitedListing(input: {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[] | null;
  images?: Array<string | { url?: string | null; key?: string | null }> | null;
}): ProhibitedMatch {
  const title = norm(input.title);
  const desc = norm(input.description);
  const cat = norm(input.category);
  const tags = (input.tags ?? []).map(norm).join(" ");
  const img = (input.images ?? [])
    .map((x) => {
      if (typeof x === "string") return norm(x);
      return norm(x?.url) + " " + norm(x?.key);
    })
    .join(" ");

  const text = [title, desc, cat, tags, img].filter(Boolean).join(" \n");

  // 1) Nicotine / vapes
  const nicotineRe =
    /\b(vape|vaping|e-?cig|ecig|e\s*cig|nicotine|pouch(es)?|snus|juul|i(get)?\b|elf\s*bar|relx|pod\s*system)\b/i;

  // 2) Alcohol
  const alcoholRe =
    /\b(alcohol|beer|wine|whisk(e)?y|vodka|rum|gin|tequila|champagne|bourbon|scotch|lager|cider)\b/i;

  // 3) Sexual / fetish content (keep broad but not insane; we only need to block explicit/fetish commerce)
  const sexualRe =
    /\b(sex\s*toy|dildo|vibrator|butt\s*plug|anal\s*plug|bdsm|bondage|fetish|kink|lingerie\s*(for\s*sex)?|porn|onlyfans|escort|adult\s*toy)\b/i;

  if (nicotineRe.test(text)) return { blocked: true, category: "NICOTINE_VAPE", evidence: ["nicotine/vape keywords"] };
  if (alcoholRe.test(text)) return { blocked: true, category: "ALCOHOL", evidence: ["alcohol keywords"] };
  if (sexualRe.test(text)) return { blocked: true, category: "SEXUAL_FETISH", evidence: ["sexual/fetish keywords"] };

  return { blocked: false };
}

/**
 * Compatibility exports (routes expect these names)
 * Keep logic centralized in checkProhibitedListing.
 */
export function listingLooksProhibited(input: {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[] | null;
  images?: Array<string | { url?: string | null; key?: string | null }> | null;
}): boolean {
  return checkProhibitedListing(input).blocked === true;
}

export function textLooksProhibited(text: string): boolean {
  return checkProhibitedListing({ title: text }).blocked === true;
}

