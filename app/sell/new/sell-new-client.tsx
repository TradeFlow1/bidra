"use client";
import Link from "next/link";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { FULL_CATEGORIES, CATEGORY_GROUPS, joinCategory } from "@/lib/categories";

type CatRule = { cat: string; kws: string[] };

const CATEGORY_RULES: CatRule[] = [
  { cat: "Phones & Accessories", kws: ["iphone","android","phone","mobile","samsung","pixel","charger","case","airpods"] },
  { cat: "Computers", kws: ["laptop","macbook","pc","desktop","monitor","keyboard","mouse","ssd","gpu","graphics","ram"] },
  { cat: "Gaming", kws: ["ps5","playstation","xbox","switch","nintendo","controller","gaming","steamdeck"] },
  { cat: "TV & Audio", kws: ["tv","television","soundbar","speaker","subwoofer","receiver","amplifier","headphones"] },
  { cat: "Cameras", kws: ["camera","dslr","mirrorless","lens","gopro","canon","nikon","sony a7"] },

  { cat: "Living Room", kws: ["sofa","couch","armchair","coffee table","tv unit","entertainment unit","rug"] },
  { cat: "Bedroom", kws: ["bed","mattress","bedframe","dresser","wardrobe","side table","bedside"] },
  { cat: "Dining", kws: ["dining","table","chairs","bar stool","buffet","hutch"] },
  { cat: "Outdoor & Garden", kws: ["outdoor","patio","bbq","grill","garden","lawn","mower","trimmer"] },
  { cat: "Home Decor", kws: ["mirror","lamp","vase","art","decor","curtain","blinds"] },

  { cat: "Kitchen Appliances", kws: ["fridge","refrigerator","microwave","air fryer","toaster","kettle","blender","coffee machine"] },
  { cat: "Laundry Appliances", kws: ["washer","washing machine","dryer","laundry"] },
  { cat: "Heating & Cooling", kws: ["aircon","air con","heater","fan","portable air conditioner"] },
  { cat: "Vacuums", kws: ["vacuum","dyson","roomba"] },

  { cat: "Power Tools", kws: ["drill","impact","saw","circular saw","jigsaw","sander","makita","dewalt","milwaukee"] },
  { cat: "Hand Tools", kws: ["spanner","wrench","socket","hammer","screwdriver","pliers"] },
  { cat: "Building Materials", kws: ["timber","wood","plywood","gyprock","cement","bricks"] },

  { cat: "Men's Clothing", kws: ["mens","men's","jacket","shirt","pants","jeans","hoodie"] },
  { cat: "Women's Clothing", kws: ["womens","women's","dress","skirt","blouse","heels"] },
  { cat: "Shoes", kws: ["shoes","sneakers","boots","nike","adidas"] },
  { cat: "Bags", kws: ["bag","handbag","backpack","luggage"] },
  { cat: "Jewellery & Watches", kws: ["watch","rolex","seiko","jewellery","ring","necklace"] },

  { cat: "Fitness", kws: ["dumbbell","weights","treadmill","bench","gym","yoga","protein"] },
  { cat: "Camping", kws: ["tent","swag","sleeping bag","camping","esky","gazebo"] },
  { cat: "Cycling", kws: ["bike","bicycle","helmet","mtb","road bike"] },
  { cat: "Fishing", kws: ["fishing","rod","reel","tackle","bait"] },
  { cat: "Water Sports", kws: ["surf","surfboard","sup","paddle board","kayak"] },

  { cat: "Toys", kws: ["lego","toy","doll","action figure","hot wheels"] },
  { cat: "Games", kws: ["board game","card game","puzzle"] },
  { cat: "Kids Clothing", kws: ["kids","kid's","child","children","size 4","size 6"] },

  { cat: "Cars", kws: ["car","sedan","hatch","ute","4x4","ford","holden","toyota"] },
  { cat: "Motorcycles", kws: ["motorbike","motorcycle","helmet","yamaha","honda","kawasaki"] },
  { cat: "Vehicle Parts & Accessories", kws: ["tyres","tires","rim","wheels","car parts","towbar","roof rack"] },
  { cat: "Boats & Marine", kws: ["boat","marine","outboard","jetski","jet ski"] },
  { cat: "Caravans & Campers", kws: ["caravan","camper","campervan","rv"] },

  { cat: "Books", kws: ["book","novel","textbook","paperback","hardcover"] },
  { cat: "Movies", kws: ["dvd","bluray","blu-ray","movie"] },
  { cat: "Music", kws: ["vinyl","record","cd","guitar","piano"] },

  { cat: "Coins", kws: ["coin","coins","currency"] },
  { cat: "Trading Cards", kws: ["pokemon","mtg","magic the gathering","trading card"] },
  { cat: "Memorabilia", kws: ["memorabilia","signed","autograph"] },
  { cat: "Antiques", kws: ["antique","vintage"] },

  { cat: "Pet Supplies (NO LIVE ANIMALS)", kws: ["dog","cat","pet","leash","collar","litter","aquarium"] },
];

const KEYWORD_BUCKETS: { cat: string; kws: string[] }[] = [
  // Tech & Electronics
  { cat: "Tech & Electronics › Phones & Accessories", kws: ["iphone","android","samsung","pixel","phone","mobile","charger","case","airpods","sim","telstra","optus","vodafone"] },
  { cat: "Tech & Electronics › Computers", kws: ["laptop","notebook","macbook","imac","pc","desktop","computer","monitor","keyboard","mouse","ssd","hdd","hard drive","gpu","graphics card","ram","motherboard","windows","linux"] },
  { cat: "Tech & Electronics › Gaming", kws: ["playstation","ps4","ps5","xbox","nintendo","switch","controller","console","game console","steam deck"] },
  { cat: "Tech & Electronics › TV & Audio", kws: ["tv","television","soundbar","speaker","speakers","subwoofer","headphones","earbuds","stereo","amplifier","receiver"] },
  { cat: "Tech & Electronics › Cameras", kws: ["camera","dslr","mirrorless","gopro","lens","tripod","canon","nikon","sony"] },

  // Home & Furniture
  { cat: "Home & Furniture › Living Room", kws: ["sofa","couch","lounge","coffee table","tv unit","entertainment unit","recliner"] },
  { cat: "Home & Furniture › Bedroom", kws: ["bed","mattress","frame","wardrobe","dresser","drawers","bedside","nightstand"] },
  { cat: "Home & Furniture › Dining", kws: ["dining table","dining set","chairs","bar stools","buffet","sideboard"] },
  { cat: "Home & Furniture › Outdoor & Garden", kws: ["outdoor setting","patio","deck","bbq","grill","umbrella","gazebo"] },
  { cat: "Home & Furniture › Office Furniture", kws: ["desk","office chair","standing desk","filing cabinet"] },
  { cat: "Home & Furniture › Storage", kws: ["shelves","shelving","storage","cupboard","cabinet","rack"] },
  { cat: "Home & Furniture › Home Decor", kws: ["rug","curtains","blinds","lamp","mirror","artwork","vase","cushion"] },

  // Appliances
  { cat: "Appliances › Kitchen Appliances", kws: ["fridge","freezer","microwave","dishwasher","oven","cooktop","air fryer","kettle","toaster","coffee machine","mixer"] },
  { cat: "Appliances › Laundry Appliances", kws: ["washing machine","washer","dryer","tumble dryer"] },
  { cat: "Appliances › Heating & Cooling", kws: ["aircon","air conditioner","heater","fan","dehumidifier"] },
  { cat: "Appliances › Vacuums", kws: ["vacuum","dyson","robot vacuum","roomba","vacuum cleaner","stick vacuum","miele"] },

  // Tools & DIY
  { cat: "Tools & DIY › Power Tools", kws: ["drill","impact","driver","saw","circular","jigsaw","sander","grinder","router","nail gun","compressor","air compressor","makita","dewalt","milwaukee","ryobi","ozito"] },
  { cat: "Tools & DIY › Hand Tools", kws: ["spanner","wrench","socket","ratchet","hammer","screwdriver","pliers","allen","hex","chisel","clamp","vice","tape measure","level","stanley knife","utility knife","tool kit","toolbox"] },
  { cat: "Tools & DIY › Garden Tools", kws: ["lawn mower","mower","whipper","line trimmer","hedge trimmer","blower","leaf blower","chainsaw","edger","rake","shovel","spade","secateurs"] },
  { cat: "Tools & DIY › Building Materials", kws: ["timber","wood","plywood","mdf","gyprock","drywall","cement","concrete","bricks","pavers","steel","aluminium","insulation","paint","primer","tiles"] },

  // Sports & Outdoors
  { cat: "Sports & Outdoors › Fitness", kws: ["treadmill","weights","dumbbell","barbell","gym","exercise bike","rowing machine","bench press","kettlebell"] },
  { cat: "Sports & Outdoors › Camping", kws: ["tent","swag","sleeping bag","camping","esky","gazebo","camp chair"] },
  { cat: "Sports & Outdoors › Cycling", kws: ["bike","bicycle","helmet","mtb","road bike","bmx"] },
  { cat: "Sports & Outdoors › Fishing", kws: ["fishing","rod","reel","tackle","bait"] },
  { cat: "Sports & Outdoors › Water Sports", kws: ["surf","surfboard","sup","paddle board","kayak","wetsuit"] },

  // Kids & Toys
  { cat: "Kids & Toys › Toys", kws: ["lego","toy","doll","action figure","hot wheels","barbie"] },
  { cat: "Kids & Toys › Games", kws: ["board game","card game","puzzle"] },
  { cat: "Kids & Toys › Kids Clothing", kws: ["kids","kid's","child","children","size 4","size 6","size 8","size 10"] },

  // Books & Media
  { cat: "Books & Media › Books", kws: ["book","novel","textbook","paperback","hardcover"] },
  { cat: "Books & Media › Movies", kws: ["dvd","bluray","blu-ray","movie"] },
  { cat: "Books & Media › Music", kws: ["vinyl","record","cd","guitar","piano","keyboard instrument"] },
  { cat: "Books & Media › Games", kws: ["board game","card game","puzzle"] },

  // Collectibles & Vintage
  { cat: "Collectibles & Vintage › Coins", kws: ["coin","coins","currency"] },
  { cat: "Collectibles & Vintage › Trading Cards", kws: ["pokemon","mtg","magic the gathering","trading card"] },
  { cat: "Collectibles & Vintage › Memorabilia", kws: ["memorabilia","signed","autograph"] },
  { cat: "Collectibles & Vintage › Antiques", kws: ["antique","vintage"] },

  // Vehicles
  { cat: "Vehicles › Cars", kws: ["car","sedan","hatch","ute","4x4","4wd","ford","holden","toyota","mazda","hyundai","kia"] },
  { cat: "Vehicles › Motorcycles", kws: ["motorbike","motorcycle","helmet","yamaha","honda","kawasaki","ducati"] },
  { cat: "Vehicles › Vehicle Parts & Accessories", kws: ["tyres","tires","rim","wheels","car parts","towbar","roof rack","battery","dashcam"] },
  { cat: "Vehicles › Boats & Marine", kws: ["boat","marine","outboard","jetski","jet ski"] },
  { cat: "Vehicles › Caravans & Campers", kws: ["caravan","camper","campervan","rv"] },

  // Pet Supplies
  { cat: "Pet Supplies (NO LIVE ANIMALS)", kws: ["dog","cat","pet","leash","collar","litter","aquarium","kennel","harness","pet bed","crate","carrier","scratching post","cat tree","fish tank"] },

  // Fashion & Wearables
  { cat: "Fashion & Wearables › Men's Clothing", kws: ["mens","men's","shirt","tshirt","tee","hoodie","jumper","jacket","jeans","shorts","pants","suit","tie"] },
  { cat: "Fashion & Wearables › Women's Clothing", kws: ["womens","women's","dress","skirt","blouse","top","heels","cardigan","jacket","jeans","activewear","leggings"] },
  { cat: "Fashion & Wearables › Shoes", kws: ["shoes","sneakers","runners","boots","heels","sandals","thongs","nike","adidas","asics","new balance"] },
  { cat: "Fashion & Wearables › Bags", kws: ["bag","handbag","backpack","rucksack","wallet","purse","luggage","suitcase"] },
  { cat: "Fashion & Wearables › Jewellery & Watches", kws: ["watch","watches","rolex","seiko","casio","ring","necklace","bracelet","earrings","jewellery","jewelry"] },

  // Beauty & Personal Care
  { cat: "Beauty & Personal Care › Skincare", kws: ["skincare","cleanser","moisturiser","moisturizer","serum","sunscreen","spf","retinol","toner"] },
  { cat: "Beauty & Personal Care › Hair Care", kws: ["shampoo","conditioner","hair dryer","hairdryer","straightener","curling iron","ghd","dyson airwrap"] },
  { cat: "Beauty & Personal Care › Fragrances", kws: ["perfume","cologne","fragrance","eau de parfum","aftershave"] },
  { cat: "Beauty & Personal Care › Grooming", kws: ["shaver","razor","clippers","trimmer","beard","grooming"] },

  // Baby & Nursery
  { cat: "Baby & Nursery › Prams", kws: ["pram","stroller","pushchair","buggy"] },
  { cat: "Baby & Nursery › Car Seats", kws: ["car seat","baby seat","booster seat","capsule"] },
  { cat: "Baby & Nursery › Nursery Furniture", kws: ["cot","crib","bassinet","change table","change pad","high chair","nursery"] },

  // Art
  { cat: "Art › Paintings", kws: ["painting","canvas","acrylic","oil painting","watercolour","watercolor"] },
  { cat: "Art › Sculpture", kws: ["sculpture","statue","ceramic","clay","bronze"] },
  { cat: "Art › Photography", kws: ["photography","photo print","print","framed print"] },

  // Office & Business
  { cat: "Office & Business › Office Equipment", kws: ["printer","scanner","label printer","shredder","laminator","monitor arm","docking station"] },
  { cat: "Office & Business › Supplies", kws: ["stationery","paper","notebook","pens","labels","ink","toner"] },
  { cat: "Office & Business › POS & Retail", kws: ["pos","eftpos","receipt printer","cash drawer","barcode scanner","square terminal"] },

  // Industrial
  { cat: "Industrial › Machinery", kws: ["machinery","lathe","mill","press","forklift","generator","welder","welding"] },
  { cat: "Industrial › Electrical", kws: ["electrical","cable","conduit","switchboard","breaker","inverter"] },
  { cat: "Industrial › Safety Equipment", kws: ["safety","ppe","hi vis","high vis","helmet","gloves","goggles","earmuffs","respirator"] },

  // Health & Medical (non-prescription)
  { cat: "Health & Medical (non-prescription) › Mobility", kws: ["wheelchair","walker","walking frame","mobility scooter","crutches","cane"] },
  { cat: "Health & Medical (non-prescription) › Monitoring Devices", kws: ["blood pressure","bp monitor","thermometer","pulse oximeter","oximeter","glucose monitor"] },
  { cat: "Health & Medical (non-prescription) › Wellness", kws: ["massage gun","foam roller","yoga mat","meditation","sauna blanket"] },

  // Tickets (where permitted)
  { cat: "Tickets (where permitted) › Events", kws: ["tickets","event ticket","festival ticket","gig ticket"] },
  { cat: "Tickets (where permitted) › Sport", kws: ["match ticket","game ticket","sport ticket"] },
  { cat: "Tickets (where permitted) › Theatre", kws: ["theatre ticket","theater ticket","show ticket","musical"] },

  // Services
  { cat: "Services › Trade Services", kws: ["plumber","electrician","tradie","handyman","tiling","painting service"] },
  { cat: "Services › Creative Services", kws: ["design","graphic design","photographer","videographer","logo"] },
  { cat: "Services › Lessons", kws: ["tutor","tutoring","lessons","guitar lessons","piano lessons","driving lessons"] },

  // Free items + Other
  { cat: "Free items", kws: ["free","giveaway","free to good home","no charge"] },
  { cat: "Other", kws: ["misc","miscellaneous","assorted","bundle","lot"] },
];
function normalizeSuggestedCategory(raw: string): string {
  const v = String(raw || "").trim();
  if (!v) return "";
  // If it's already a valid FULL_CATEGORIES entry, keep it
  if (FULL_CATEGORIES.includes(v)) return v;

  // If it's a child label, convert to "Parent › Child"
  for (const g of CATEGORY_GROUPS) {
    for (const c of g.children) {
      if (c === v) return joinCategory(g.parent, c);
    }
  }

  return "";
}

function suggestCategoryFromText(textRaw: string): string {
  const t = (textRaw || "").toLowerCase();

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hasToken = (token: string) => {
    const k = String(token || "").trim().toLowerCase();
    if (!k) return false;
    if (k.includes(" ")) return t.includes(k);
    const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(k)}([^a-z0-9]|$)`);
    return re.test(t);
  };

  // Strong pet/animal signals ONLY (prevents "tools" -> pets)
  const petSignals = [
    "dog","cat","puppy","kitten","bird","fish","reptile","rabbit","hamster",
    "pet","aquarium","kennel","leash","collar","harness","litter","crate","cage"
  ];
  const hasPetSignal = petSignals.some((k) => hasToken(k));

  // Tools / garage / workshop signals
  const toolSignals = [
    "tool","tools","garage","workshop","shed","diy","tradie",
    "drill","driver","impact","saw","socket","spanner","wrench","hammer",
    "grinder","compressor","ladder","sander","router","jigsaw","circular",
    "ratchet","allen","hex","pliers","vice","clamp","chisel","workbench"
  ];
  const hasToolSignal = toolSignals.some((k) => hasToken(k));

  // Weighted scoring. Return "" when uncertain (no suggestion shown)
  let best = "";
  let bestScore = 0;

  const score = (name: string, keys: string[], weight: number) => {
    let s = 0;
    for (const k of keys) if (hasToken(k)) s += weight;
    if (s > bestScore) { bestScore = s; best = name; }
  };

  // IMPORTANT: pets only if real pet signals exist
  if (hasPetSignal) {
    score("Pet Supplies (NO LIVE ANIMALS)", petSignals, 3);
  }

  // Tools should win very easily for garage/tool text
  if (hasToolSignal) {
    const powerSignals = ["drill","impact","saw","circular","jigsaw","sander","grinder","router","compressor","makita","dewalt","milwaukee"];
    const handSignals  = ["spanner","wrench","socket","ratchet","hammer","screwdriver","pliers","allen","hex","chisel","clamp","vice"];

    score("Hand Tools", handSignals.concat(["tool","tools","garage","workshop","shed","diy","tradie","workbench"]), 3);
    score("Power Tools", powerSignals.concat(["power tool","powertools"]), 3);
    score("Garden Tools", ["garden","lawn","mower","blower","whipper","line trimmer","hedge trimmer","edger"], 3);
    score("Building Materials", ["timber","wood","plywood","gyprock","drywall","cement","concrete","bricks","pavers","steel","aluminium"], 3);
  }

  // Comprehensive keyword buckets
  for (const b of KEYWORD_BUCKETS) {
    score(b.cat, b.kws, 2);
  }

  // Parent-level nudges (REAL Bidra categories only)
  score("Tech & Electronics", ["electronics","tech","gadget","device"], 2);
  score("Home & Furniture", ["furniture","sofa","couch","table","chair","bed","dresser","wardrobe"], 2);
  score("Vehicles", ["vehicle","cars","car","ute","4wd","truck","boat","motorcycle","caravan"], 2);

  const normalized = normalizeSuggestedCategory(best);

  // Confidence threshold
  if (!normalized) return "";
  if (bestScore < 3) return "";
  return normalized;
}
function suggestDescriptionDraft(args: {
  title: string;
  category: string;
  condition: string;
  type: "FIXED_PRICE" | "TIMED_OFFERS";
  priceLabel: string;
  location: string;
}): string {
  const title = (args.title || "").trim();
  const category = (args.category || "").trim();
  const condition = (args.condition || "").trim();
  const priceLabel = (args.priceLabel || "").trim();
  const location = (args.location || "").trim();

  const lines: string[] = [];
  if (title) lines.push(`Selling: ${title}.`);
  if (category) lines.push(`Category: ${category}.`);
  if (condition) lines.push(`Condition: ${condition.replaceAll("_", " ").toLowerCase()}.`);

  // Simple “AI-like” structure: details + pickup + payment note
  lines.push("");
  lines.push("Details:");
  lines.push("- Included: (add what’s included)");
  lines.push("- Reason for selling: (optional)");
  lines.push("- Any marks or faults: (be honest)");

  lines.push("");
  if (args.type === "TIMED_OFFERS") {
    lines.push("Timed offers: I’ll review offers when the time ends and decide whether to proceed with the highest offer.");
  } else if (priceLabel) {
    lines.push(`Price: ${priceLabel}.`);
  }

  if (location) {
    lines.push(`Pickup location: ${location}.`);
  } else {
    lines.push("Pickup location: (your suburb).");
  }

  lines.push("Pickup preferred. If you need delivery, message me to discuss.");
  return lines.join("\n");
}

type ListingTypeUI = "FIXED_PRICE" | "TIMED_OFFERS";

function dollarsToCentsOrNull(v: string): number | null {
  const raw = (v ?? "").trim();
  if (!raw) return null;

  // Allow common user paste formats like "$1,200" or "1 200"
  const cleaned = raw.replace(/[$,\s]/g, "");
  const n = Number(cleaned);

  if (!Number.isFinite(n)) return NaN as any;
  return Math.round(n * 100);
}

export default function SellNewClient({ defaultLocation = "" }: { defaultLocation?: string }) {
  const [feedbackGate, setFeedbackGate] = React.useState<null | {
    message: string;
    pendingCount: number;
    feedbackUrl: string | null;
  }>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let old: any = undefined;
    try {
      if ("scrollRestoration" in window.history) {
        old = (window.history as any).scrollRestoration;
        (window.history as any).scrollRestoration = "manual";
      }
    } catch {}

    try { window.scrollTo({ top: 0, left: 0 }); } catch {}

    return () => {
      try {
        if (old !== undefined && "scrollRestoration" in window.history) {
          (window.history as any).scrollRestoration = old;
        }
      } catch {}
    };
  }, []);

  const [type, setType] = useState<ListingTypeUI>("FIXED_PRICE");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof FULL_CATEGORIES)[number] | "">("");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [condition, setCondition] = useState("USED");
  const [location, setLocation] = useState((defaultLocation || "").trim());

  // FIXED_PRICE dollars
  const [price, setPrice] = useState("");

  // Timed offers dollars
  const [startingBid, setStartingBid] = useState("");
  const [reservePrice, setReservePrice] = useState(""); // optional
  const [buyNowPrice, setBuyNowPrice] = useState(""); // optional
  const [durationDays, setDurationDays] = useState("7");

  // Images
  const [files, setFiles] = useState<File[]>([]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isTimedOffers = type === "TIMED_OFFERS";
  const categoryOptions = useMemo(() => FULL_CATEGORIES, []);

  const suggestedCategory = useMemo(() => {
    const blob = `${title} ${description}`.trim();
    return suggestCategoryFromText(blob);
  }, [title, description]);

  // Auto-apply suggestion only if the user hasn't chosen a category yet
  useEffect(() => {
    if (categoryTouched) return;
    if (category) return;
    if (suggestedCategory) setCategory(suggestedCategory as any);
  }, [suggestedCategory, categoryTouched, category]);

  const previews = useMemo(() => {
    return files.slice(0, 10).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }, [files]);

  function sanitizeMoneyInput(v: string): string {
    const s = String(v ?? "");
    let out = "";
    let seenDot = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch >= "0" && ch <= "9") { out += ch; continue; }
      if (ch === "." && !seenDot) { out += "."; seenDot = true; continue; }
    }
    return out;
  }
  async function onSubmit(e: React.FormEvent) {
    setFeedbackGate(null);
    e.preventDefault();
    setErr(null);

    const t = title.trim();
    const d = description.trim();
    const loc = location.trim();

    if (t.length < 3) return setErr("Title must be at least 3 characters.");
    if (d.length < 3) return setErr("Description must be at least 3 characters.");
    if (!category) return setErr("Category is required.");
    if (!loc) return setErr("Location is required.");

    
    const fixedPriceCents = dollarsToCentsOrNull(price);
    const startBidCents = dollarsToCentsOrNull(startingBid);
    const reserveCents = dollarsToCentsOrNull(reservePrice);
    const buyNowCents = dollarsToCentsOrNull(buyNowPrice);

    if (!Number.isFinite(Number(durationDays))) return setErr("Duration is invalid.");

    if (!isTimedOffers) {
      if (fixedPriceCents === null || Number.isNaN(fixedPriceCents) || fixedPriceCents <= 0) {
        return setErr("Price must be greater than 0.");
      }
    } else {
      if (startBidCents === null || Number.isNaN(startBidCents) || startBidCents <= 0) {
        return setErr("Starting offer must be greater than 0.");
      }

      if (reserveCents !== null) {
        if (Number.isNaN(reserveCents)) return setErr("Reserve must be a number or blank.");
        if (reserveCents <= 0) return setErr("Reserve must be greater than 0 (or blank).");
        if (reserveCents < startBidCents) return setErr("Reserve must be ≥ starting offer.");
      }

      if (buyNowCents !== null) {
        if (Number.isNaN(buyNowCents)) return setErr("Buy Now must be a number or blank.");
        if (buyNowCents <= 0) return setErr("Buy Now must be greater than 0 (or blank).");
        if (buyNowCents < startBidCents) return setErr("Buy Now must be ≥ starting offer.");
        if (reserveCents !== null && buyNowCents < reserveCents) return setErr("Buy Now must be ≥ reserve.");
      }
    }

    setBusy(true);
    try {
      // 1) Upload selected files (preferred)
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        const fd = new FormData();
        for (const f of files.slice(0, 10)) fd.append("files", f);

        const up = await fetch("/api/uploads/images", { method: "POST", body: fd });
        const upText = await up.text();
        let upData: any = null;
        try { upData = JSON.parse(upText); } catch { upData = null; }

        if (!up.ok) {
          const msg = (upData && upData.error) ? String(upData.error) : upText || "Image upload failed.";
          setErr(msg);
          return;
        }

        uploadedUrls = Array.isArray(upData?.urls) ? upData.urls : [];
      }

      const imagesToSend = uploadedUrls;

      // 2) Create listing
      const res = await fetch("/api/listings/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: isTimedOffers ? "AUCTION" : "FIXED_PRICE",
          title: t,
          description: d,
          category,
          condition: condition.trim(),
          location: loc,

          // cents
          price: isTimedOffers ? null : fixedPriceCents,
          startingBid: isTimedOffers ? startBidCents : null,

          reservePrice: isTimedOffers ? reserveCents : null,
          buyNowPrice: isTimedOffers ? buyNowCents : null,

          durationDays: isTimedOffers ? Number(durationDays) : null,

          images: imagesToSend,
        }),
      });

      // If session expired / not signed in, send to login and come back here.
      if (res.status === 401) {
        router.push("/auth/login?next=/sell/new");
        return;
      }

      // Read body exactly once, then parse JSON from it if possible
      const text = await res.text().catch(() => "");
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }

      // Feedback trust gate: if overdue feedback blocks listing creation, show a friendly CTA.
      if (res.status === 403) {
        if (data && (data.code === "FEEDBACK_REQUIRED" || data.error === "FEEDBACK_REQUIRED")) {
          setFeedbackGate({
            message: data.error || data.message || "Please leave feedback to continue.",
            pendingCount: Number(data.pendingCount || 0),
            feedbackUrl: data.feedbackUrl || null,
          });
          return;
        }

        const reason = (data && (data.reason || data.error)) ? String(data.reason || data.error) : "";
        const msg =
          reason === "MISSING_AGE_VERIFICATION" ? "Please add your date of birth in Account settings (18+ required) to list items." :
          reason === "AGE_NOT_VERIFIED" ? "Your account isn’t age-verified yet. Please complete age verification to list items." :
          reason === "UNDER_18" ? "Bidra accounts are 18+ only. You can browse publicly, but you can’t list or bid." :
          reason === "POLICY_BLOCKED" ? "Your account is temporarily restricted. Please try again later." :
          "You can’t create a listing right now.";
        setErr(msg);
        return;
      }

      if (!res.ok) {
        const msg = (data && data.error) ? String(data.error) : text || "Failed to create listing.";
        setErr(msg);
        return;
      }

      const id = data?.listing?.id;
      if (id) router.push(`/listings/${id}`);
      else router.push("/listings");
    } finally {
      // cleanup preview object URLs
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setBusy(false);
    }
  }

  return (
    <div className="bd-card p-5">
<p className="mt-2 text-sm bd-ink2">
        Add the basics — title, description, category, condition, location, and pricing.
      </p>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</div>
      )}
      {feedbackGate && (
        <div className="mb-4 bd-card p-5">
          <div className="text-base font-extrabold bd-ink">Feedback required</div>
          <div className="mt-1 text-sm bd-ink2">{feedbackGate.message}</div>
          {feedbackGate.feedbackUrl && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={feedbackGate.feedbackUrl}
                className="bd-btn bd-btn-primary text-center"
              >
                Leave feedback to continue
              </Link>
              <Link
                href="/orders"
                className="bd-btn bd-btn-ghost text-center"
              >
                Go to Orders
              </Link>
            </div>
          )}
        </div>
      )}

  <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div>
          <label className="text-sm font-medium">Sale type</label>
          <select
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as ListingTypeUI)}
          >
            <option value="FIXED_PRICE">Fixed price</option>
            <option value="TIMED_OFFERS">Timed offers</option>
          </select>
          <div className="mt-1 text-xs bd-ink2">
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Title</label>
          <input className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="bd-btn bd-btn-ghost py-1 px-2 text-xs"
              onClick={() => {
                const priceLabel = type === "TIMED_OFFERS" ? (startingBid ? `$${startingBid} starting` : "") : (price ? `$${price}` : "");
                const draft = suggestDescriptionDraft({
                  title,
                  category: String(category || ""),
                  condition,
                  type,
                  priceLabel,
                  location,
                });
                setDescription(draft);
              }}
            >
              Suggest description
            </button>
            <span className="text-xs bd-ink2">Fills a draft you can edit.</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          {suggestedCategory && suggestedCategory !== category && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs bd-ink2">
              <span>Suggested: <span className="font-semibold bd-ink">{suggestedCategory}</span></span>
              <button
                type="button"
                className="bd-btn bd-btn-ghost py-1 px-2 text-xs"
                onClick={() => { setCategoryTouched(true); setCategory(suggestedCategory as any); }}
              >
                Use suggestion
              </button>
            </div>
          )}
          <select
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            value={category}
            onChange={(e) => { setCategoryTouched(true); setCategory(e.target.value as any); }}
          >
            <option value="">Select a category…</option>
            {CATEGORY_GROUPS.map((g) => (
              <optgroup key={g.parent} label={g.parent}>
                <option value={g.parent}>{g.parent}</option>
                {g.children.map((c) => (
                  <option key={`${g.parent}:${c}`} value={joinCategory(g.parent, c)}>
                    {c}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Condition</label>
          <select className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="NEW">New</option>
            <option value="LIKE_NEW">Like new</option>
            <option value="USED">Used</option>
            <option value="FOR_PARTS">For parts</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Location</label>
          <input className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Suburb, State" />
        </div>

        {!isTimedOffers && (
          <div>
            <label className="text-sm font-medium">Price (AUD)</label>
            <input className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={price} onChange={(e) => setPrice(sanitizeMoneyInput(e.target.value))} placeholder="e.g. 60" inputMode="decimal" />
          </div>
        )}

        {isTimedOffers && (
          <>
            <div>
              <label className="text-sm font-medium">Starting offer (AUD)</label>
              <input className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={startingBid} onChange={(e) => setStartingBid(sanitizeMoneyInput(e.target.value))} placeholder="e.g. 60" inputMode="decimal" />
            </div>

            <div>
              <label className="text-sm font-medium">Reserve price (AUD) (optional)</label>
              <input className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={reservePrice} onChange={(e) => setReservePrice(sanitizeMoneyInput(e.target.value))} placeholder="e.g. 120" inputMode="decimal" />
              <div className="mt-1 text-xs bd-ink2">Must be ≥ starting offer. Leave blank for no reserve.</div>
            </div>

            <div>
              <label className="text-sm font-medium">Buy Now price (AUD) (optional)</label>
              <input className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={buyNowPrice} onChange={(e) => setBuyNowPrice(sanitizeMoneyInput(e.target.value))} placeholder="e.g. 200" inputMode="decimal" />
              <div className="mt-1 text-xs bd-ink2">Only shown until met/exceeded.</div>
            </div>

            <div>
              <label className="text-sm font-medium">Duration</label>
              <select className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={durationDays} onChange={(e) => setDurationDays(e.target.value)}>
                <option value="3">3 days</option>
                <option value="5">5 days</option>
                <option value="7">7 days</option>
                <option value="10">10 days</option>
                <option value="14">14 days</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium">Photos</label>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="bd-btn bd-btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Add photos
            </button>
            <div className="text-xs bd-ink2">{files.length}/10 selected (max 8MB each)</div>
          </div>

          {/* Hidden real input (no ugly "no file chosen") */}
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => { const picked = Array.from(e.target.files || []); setFiles((prev) => [...prev, ...picked].slice(0, 10)); e.currentTarget.value = ""; }}
          />

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((p, idx) => (
                <div key={p.url} className="relative overflow-hidden rounded-md border">
                  <button
                    type="button"
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold bd-ink shadow"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.name} className="h-24 w-full object-cover" />
                </div>
              ))}
            </div>
          )}


        </div>

        <button type="submit" disabled={busy} className="bd-btn bd-btn-primary text-center disabled:opacity-60">
          {busy ? "Creating..." : "Create listing"}
        </button>
      </form>
    </div>
  );
}
