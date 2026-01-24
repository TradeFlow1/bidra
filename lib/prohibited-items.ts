export const PROHIBITED_KEYWORDS: string[] = [
  // --- Nicotine / vapes ---
  "vape","vaping","vapes","e-cig","ecig","e cig","e-cigarette","ecigarette",
  "nicotine","nic salts","nic-salts","nicotine pouches","nicotine pouch",
  "juul","iqos","heat not burn","pod system","vape juice","e-liquid","eliquid",
  "disposable vape","vape pen","mods","coil","atomizer",

  // --- Alcohol ---
  "alcohol","booze","beer","wine","spirits","liquor","vodka","whisky","whiskey","rum","gin","tequila",
  "champagne","prosecco","cider","seltzer",

  // --- Sexual / fetish / porn (platform-wide prohibited) ---
  "porn","porno","pornography","sex toy","sex toys","dildo","vibrator","butt plug","anal plug",
  "fleshlight","masturbator","bdsm","bondage","fetish","kink","dominatrix",
  "onlyfans","only fans","escort","prostitute","sex work","adult content","xxx",

  // --- Weapons / restricted ---
  "gun","firearm","ammo","ammunition","rifle","pistol","shotgun","silencer","suppressor",
  "switchblade","brass knuckles","knuckleduster","knuckle duster","taser","stun gun",
  "combat knife","butterfly knife","balisong",

  // --- Drugs / controlled ---
  "cocaine","meth","ice","heroin","mdma","ecstasy","weed","marijuana","thc","cbd","magic mushrooms","psilocybin",
  "steroids","anabolic","ketamine","lsd","dmt","oxy","oxycodone","fentanyl",

  // --- Live animals (intent keywords only; avoid blocking pet supplies) ---
  "puppy","puppies","kitten","kittens",
  "live animal","live animals","live puppy","live puppies","live kitten","live kittens",

  // --- Counterfeit / stolen / illegal services ---
  "fake id","counterfeit","replica","knockoff","stolen","pirated","cracked account","hacked account"
];

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function textLooksProhibited(text: string): boolean {
  const t = String(text || "").toLowerCase();

  return PROHIBITED_KEYWORDS.some((k) => {
    const key = String(k || "").toLowerCase().trim();
    if (!key) return false;

    const isPhrase = /\s/.test(key);
    const pattern = isPhrase
      ? `(^|[^a-z0-9])${escapeRegex(key)}($|[^a-z0-9])`
      : `\\b${escapeRegex(key)}\\b`;

    try {
      const re = new RegExp(pattern, "i");
      return re.test(t);
    } catch {
      return false;
    }
  });
}

export function imagesLookProhibited(images: string[]): boolean {
  const joined = (images || []).map((u) => String(u || "").toLowerCase()).join(" ");
  if (!joined) return false;
  // scan URLs/filenames/paths for blocked words (blob URLs include sanitized file name)
  return textLooksProhibited(joined);
}

export function listingLooksProhibited(args: {
  title: string;
  description: string;
  category?: string;
  images?: string[];
}): boolean {
  const title = String(args.title || "");
  const desc = String(args.description || "");
  const cat = String(args.category || "");
  const images = Array.isArray(args.images) ? args.images : [];

  const text = `${title} ${desc} ${cat}`.toLowerCase();
  if (textLooksProhibited(text)) return true;
  if (imagesLookProhibited(images)) return true;

  return false;
}
