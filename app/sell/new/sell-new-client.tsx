"use client";
import Link from "next/link";
import Image from "next/image";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  BIDRA_CATEGORIES,
  findCategoryByKey,
  findSubcategory,
  FULL_CATEGORIES,
  joinCategory,
} from "@/lib/categories";

type CategorySuggestion = {
  categoryKey: string;
  subcategoryKey: string | null;
  categoryLabel: string;
};

type ListingTypeUI = "BUY_NOW" | "TIMED_OFFERS";

type SuggestionRule = {
  categoryKey: string;
  subcategoryKey: string | null;
  kws: string[];
};

const SUGGESTION_RULES: SuggestionRule[] = [
  { categoryKey: "fashion", subcategoryKey: "jewellery", kws: ["watch","watches","rolex","seiko","casio","ring","rings","necklace","bracelet","earrings","jewellery","jewelry"] },
  { categoryKey: "electronics", subcategoryKey: "phones", kws: ["iphone","android","phone","mobile","samsung","pixel","charger","case","airpods"] },
  { categoryKey: "electronics", subcategoryKey: "computers", kws: ["laptop","macbook","pc","desktop","computer","monitor","keyboard","mouse","ssd","gpu","graphics","ram"] },
  { categoryKey: "electronics", subcategoryKey: "gaming", kws: ["ps5","playstation","xbox","switch","nintendo","controller","gaming","steamdeck"] },
  { categoryKey: "electronics", subcategoryKey: "audio", kws: ["speaker","soundbar","headphones","earbuds","amp","amplifier","receiver","audio"] },
  { categoryKey: "electronics", subcategoryKey: "cameras", kws: ["camera","dslr","mirrorless","lens","gopro","canon","nikon","sony"] },
  { categoryKey: "electronics", subcategoryKey: "tvs", kws: ["tv","television","oled","qled"] },
  { categoryKey: "home-furniture", subcategoryKey: "sofas", kws: ["sofa","couch","lounge","recliner"] },
  { categoryKey: "home-furniture", subcategoryKey: "beds", kws: ["bed","mattress","bedframe","bedside"] },
  { categoryKey: "home-furniture", subcategoryKey: "tables", kws: ["table","dining table","coffee table","desk"] },
  { categoryKey: "home-furniture", subcategoryKey: "storage", kws: ["wardrobe","dresser","drawers","cabinet","shelves","storage"] },
  { categoryKey: "home-furniture", subcategoryKey: "decor", kws: ["mirror","lamp","rug","art","decor","vase"] },
  { categoryKey: "appliances", subcategoryKey: "kitchen", kws: ["fridge","refrigerator","microwave","air fryer","toaster","kettle","blender","coffee machine","dishwasher","oven"] },
  { categoryKey: "appliances", subcategoryKey: "laundry", kws: ["washer","washing machine","dryer","laundry"] },
  { categoryKey: "appliances", subcategoryKey: "heating-cooling", kws: ["aircon","air conditioner","heater","fan","dehumidifier"] },
  { categoryKey: "tools-diy", subcategoryKey: "power-tools", kws: ["drill","impact","saw","jigsaw","sander","makita","dewalt","milwaukee","router","grinder"] },
  { categoryKey: "tools-diy", subcategoryKey: "hand-tools", kws: ["spanner","wrench","socket","hammer","screwdriver","pliers","ratchet","allen","hex","chisel"] },
  { categoryKey: "tools-diy", subcategoryKey: "building-supplies", kws: ["timber","wood","plywood","gyprock","cement","bricks","concrete","tiles"] },
  { categoryKey: "fashion", subcategoryKey: "womens", kws: ["womens","women's","dress","skirt","blouse","heels"] },
  { categoryKey: "fashion", subcategoryKey: "mens", kws: ["mens","men's","jacket","shirt","pants","jeans","hoodie"] },
  { categoryKey: "fashion", subcategoryKey: "shoes", kws: ["shoes","sneakers","boots","nike","adidas"] },
  { categoryKey: "fashion", subcategoryKey: "bags", kws: ["bag","handbag","backpack","luggage","wallet"] },
  { categoryKey: "baby-kids", subcategoryKey: "toys", kws: ["lego","toy","doll","action figure","hot wheels"] },
  { categoryKey: "baby-kids", subcategoryKey: "clothing", kws: ["kids","kid's","children","child","baby clothes"] },
  { categoryKey: "baby-kids", subcategoryKey: "nursery", kws: ["cot","crib","bassinet","nursery","change table"] },
  { categoryKey: "baby-kids", subcategoryKey: "prams", kws: ["pram","stroller","pushchair","buggy"] },
  { categoryKey: "sports-outdoors", subcategoryKey: "fitness", kws: ["dumbbell","weights","treadmill","bench","gym","barbell"] },
  { categoryKey: "sports-outdoors", subcategoryKey: "camping", kws: ["tent","swag","sleeping bag","camping","esky","gazebo"] },
  { categoryKey: "sports-outdoors", subcategoryKey: "cycling", kws: ["bike","bicycle","helmet","mtb","road bike"] },
  { categoryKey: "vehicles", subcategoryKey: "cars", kws: ["car","sedan","hatch","ute","4x4","toyota","ford","mazda","kia"] },
  { categoryKey: "vehicles", subcategoryKey: "motorcycles", kws: ["motorbike","motorcycle","helmet","yamaha","honda","kawasaki"] },
  { categoryKey: "vehicles", subcategoryKey: "parts", kws: ["tyres","tires","rim","wheels","car parts","towbar","roof rack"] },
  { categoryKey: "property", subcategoryKey: "rentals", kws: ["rent","rental","lease","apartment for rent","unit for rent"] },
  { categoryKey: "property", subcategoryKey: "home-sales", kws: ["house for sale","home for sale","apartment for sale","unit for sale"] },
  { categoryKey: "hobbies-collectibles", subcategoryKey: "collectibles", kws: ["collectible","collectibles","pokemon","trading card","memorabilia","antique","vintage","coin"] },
  { categoryKey: "hobbies-collectibles", subcategoryKey: "art", kws: ["art","painting","canvas","sculpture","print"] },
  { categoryKey: "hobbies-collectibles", subcategoryKey: "music", kws: ["guitar","piano","keyboard","instrument","vinyl","record"] },
  { categoryKey: "entertainment-media", subcategoryKey: "books", kws: ["book","novel","textbook","paperback","hardcover"] },
  { categoryKey: "entertainment-media", subcategoryKey: "movies", kws: ["dvd","bluray","blu-ray","movie"] },
  { categoryKey: "entertainment-media", subcategoryKey: "games", kws: ["video game","game disc","nintendo game","xbox game","ps5 game"] },
  { categoryKey: "office-business", subcategoryKey: "office-furniture", kws: ["office chair","desk","standing desk","filing cabinet"] },
  { categoryKey: "office-business", subcategoryKey: "supplies", kws: ["stationery","paper","notebook","pens","labels","ink","toner"] },
  { categoryKey: "pet-supplies", subcategoryKey: "dogs", kws: ["dog","puppy","leash","collar","kennel","crate"] },
  { categoryKey: "pet-supplies", subcategoryKey: "cats", kws: ["cat","kitten","litter","scratching post","cat tree"] },
  { categoryKey: "pet-supplies", subcategoryKey: "tanks", kws: ["aquarium","fish tank"] },
  { categoryKey: "garden-outdoor", subcategoryKey: "plants", kws: ["plant","plants","succulent","garden plant"] },
  { categoryKey: "garden-outdoor", subcategoryKey: "outdoor-furniture", kws: ["outdoor furniture","patio set","outdoor table","outdoor chair"] },
  { categoryKey: "garden-outdoor", subcategoryKey: "garden-tools", kws: ["lawn mower","mower","blower","hedge trimmer","garden tool"] },
  { categoryKey: "garden-outdoor", subcategoryKey: "bbq", kws: ["bbq","barbecue","grill"] },
  { categoryKey: "free-stuff", subcategoryKey: "free-items", kws: ["free","giveaway","free to good home","no charge"] }
];

function normalizeToken(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function textHasToken(text: string, token: string): boolean {
  const t = normalizeToken(text);
  const k = normalizeToken(token);
  if (!t || !k) return false;
  if (k.indexOf(" ") >= 0) return t.indexOf(k) >= 0;
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(k)}([^a-z0-9]|$)`);
  return re.test(t);
}

function buildCategoryLabel(categoryKey: string, subcategoryKey: string | null): string {
  const category = findCategoryByKey(categoryKey);
  if (!category) return "";
  if (!subcategoryKey) return category.label;
  const subcategory = findSubcategory(categoryKey, subcategoryKey);
  if (!subcategory) return category.label;
  return joinCategory(category.label, subcategory.label);
}

function parseCategoryLabel(value: string): { categoryKey: string; subcategoryKey: string } | null {
  const label = String(value || "").trim();
  if (!label) return null;
  for (let i = 0; i < BIDRA_CATEGORIES.length; i += 1) {
    const category = BIDRA_CATEGORIES[i];
    if (category.label === label) {
      return { categoryKey: category.key, subcategoryKey: "" };
    }
    for (let j = 0; j < category.subcategories.length; j += 1) {
      const subcategory = category.subcategories[j];
      if (joinCategory(category.label, subcategory.label) === label) {
        return { categoryKey: category.key, subcategoryKey: subcategory.key };
      }
    }
  }
  return null;
}

function suggestCategoryFromText(textRaw: string): CategorySuggestion | null {
  const text = String(textRaw || "").trim().toLowerCase();
  if (!text) return null;

  let bestRule: SuggestionRule | null = null;
  let bestScore = 0;

  for (let i = 0; i < SUGGESTION_RULES.length; i += 1) {
    const rule = SUGGESTION_RULES[i];
    let score = 0;
    for (let j = 0; j < rule.kws.length; j += 1) {
      if (textHasToken(text, rule.kws[j])) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  if (!bestRule || bestScore < 1) return null;

  const categoryLabel = buildCategoryLabel(bestRule.categoryKey, bestRule.subcategoryKey);
  if (!categoryLabel || FULL_CATEGORIES.indexOf(categoryLabel) < 0) return null;

  return {
    categoryKey: bestRule.categoryKey,
    subcategoryKey: bestRule.subcategoryKey,
    categoryLabel,
  };
}

function suggestDescriptionDraft(args: {
  title: string;
  category: string;
  condition: string;
  type: "BUY_NOW" | "TIMED_OFFERS";
  priceLabel: string;
  location: string;
}): string {
  const title = (args.title || "").trim();
  const category = (args.category || "").trim();
  const condition = String(args.condition || "").trim().replaceAll("_", " ").toLowerCase();
  const priceLabel = (args.priceLabel || "").trim();
  const location = (args.location || "").trim();

  const introParts: string[] = [];
  if (title) introParts.push(title);
  if (condition) introParts.push(condition);
  if (category) introParts.push(category);

  const lines: string[] = [];

  if (introParts.length > 0) {
    lines.push(introParts.join(" - "));
  } else {
    lines.push("Item for sale");
  }

  lines.push("");
  lines.push("Selling in good faith and happy to answer reasonable questions.");
  lines.push("Please check the photos carefully for overall condition.");

  if (args.type === "TIMED_OFFERS") {
    lines.push("This listing is set to timed offers. I will review the highest offer when it ends and decide whether to proceed.");
    if (priceLabel) {
      lines.push(`Starting point: ${priceLabel}.`);
    }
  } else if (priceLabel) {
    lines.push(`Price: ${priceLabel}.`);
  }

  if (location) {
    lines.push(`Located in ${location}.`);
  } else {
    lines.push("Located in your local area.");
  }

  lines.push("Pickup, delivery, or postage can be discussed after purchase.");
  lines.push("");
  lines.push("Suggested details to add:");
  lines.push("- what is included");
  lines.push("- any marks, wear, or faults");
  lines.push("- age, usage, or service history if relevant");

  return lines.join("\n");
}

function dollarsToCentsOrNull(v: string): number | null {
  const raw = (v ?? "").trim();
  if (!raw) return null;

  const cleaned = raw.replace(/[$,\s]/g, "");
  const n = Number(cleaned);

  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

export default function SellNewClient({ defaultLocation = "" }: { defaultLocation?: string }) {
  const [feedbackGate, setFeedbackGate] = React.useState<null | {
    message: string;
    pendingCount: number;
    feedbackUrl: string | null;
  }>(null);

  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [type, setType] = useState<ListingTypeUI>("BUY_NOW");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topCategoryKey, setTopCategoryKey] = useState("");
  const [subcategoryKey, setSubcategoryKey] = useState("");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [condition, setCondition] = useState("USED");
  const [location, setLocation] = useState((defaultLocation || "").trim());
  const [price, setPrice] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [durationDays, setDurationDays] = useState("7");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const addPicked = (picked: File[]) => {
    if (!picked || picked.length === 0) return;
    setFiles((prev) => [...prev, ...picked].slice(0, 10));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let old: any = undefined;
    try {
      if ("scrollRestoration" in window.history) {
        old = (window.history as unknown as { scrollRestoration?: string }).scrollRestoration;
        (window.history as unknown as { scrollRestoration?: string }).scrollRestoration = "manual";
      }
    } catch {}

    try { window.scrollTo({ top: 0, left: 0 }); } catch {}

    return () => {
      try {
        if (old !== undefined && "scrollRestoration" in window.history) {
          (window.history as unknown as { scrollRestoration?: string }).scrollRestoration = old as string;
        }
      } catch {}
    };
  }, []);

  function clearErrOnEdit() {
    if (err) setErr(null);
  }

  const isTimedOffers = type === "TIMED_OFFERS";
  const selectedCategory = useMemo(() => findCategoryByKey(topCategoryKey), [topCategoryKey]);
  const selectedSubcategory = useMemo(() => findSubcategory(topCategoryKey, subcategoryKey), [topCategoryKey, subcategoryKey]);
  const category = useMemo(() => {
    if (!selectedCategory) return "";
    if (selectedSubcategory) return joinCategory(selectedCategory.label, selectedSubcategory.label);
    return selectedCategory.label;
  }, [selectedCategory, selectedSubcategory]);

  const suggestedCategory = useMemo(() => {
    const blob = `${title} ${description}`.trim();
    return suggestCategoryFromText(blob);
  }, [title, description]);

  useEffect(() => {
    if (categoryTouched) return;
    if (category) return;
    if (!suggestedCategory) return;
    setTopCategoryKey(suggestedCategory.categoryKey);
    setSubcategoryKey(suggestedCategory.subcategoryKey || "");
  }, [suggestedCategory, categoryTouched, category]);

  const canSubmit = useMemo(() => {
    const t = title.trim();
    const d = description.trim();
    const loc = location.trim();

    if (t.length < 3) return false;
    if (d.length < 3) return false;
    if (!category) return false;
    if (!loc) return false;
    if (files.length < 1) return false;

    const fixedPriceCents = dollarsToCentsOrNull(price);
    const startBidCents = dollarsToCentsOrNull(startingBid);
    const buyNowCents = dollarsToCentsOrNull(buyNowPrice);

    if (!Number.isFinite(Number(durationDays))) return false;

    if (!isTimedOffers) {
      if (fixedPriceCents === null || Number.isNaN(fixedPriceCents) || fixedPriceCents <= 0) return false;
      return true;
    }

    if (startBidCents === null || Number.isNaN(startBidCents) || startBidCents <= 0) return false;

    if (buyNowCents !== null) {
      if (Number.isNaN(buyNowCents)) return false;
      if (buyNowCents <= 0) return false;
      if (buyNowCents < startBidCents) return false;
    }

    return true;
  }, [title, description, category, location, price, startingBid, buyNowPrice, durationDays, isTimedOffers, files.length]);

  const previews = useMemo(() => {
    return files.slice(0, 10).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }, [files]);

  function sanitizeMoneyInput(v: string): string {
    const s = String(v ?? "");
    let out = "";
    let seenDot = false;
    for (let i = 0; i < s.length; i += 1) {
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
    if (files.length < 1) return setErr("Add at least 1 photo to publish your listing.");

    const fixedPriceCents = dollarsToCentsOrNull(price);
    const startBidCents = dollarsToCentsOrNull(startingBid);
    const reserveCents = null;
    const buyNowCents = dollarsToCentsOrNull(buyNowPrice);

    if (!Number.isFinite(Number(durationDays))) return setErr("Duration is invalid.");
    if (isTimedOffers && ["3","5","7"].indexOf(String(durationDays)) < 0) return setErr("Timed offers duration must be 3, 5, or 7 days.");

    if (!isTimedOffers) {
      if (fixedPriceCents === null || Number.isNaN(fixedPriceCents) || fixedPriceCents <= 0) {
        return setErr("Price must be greater than 0.");
      }
    } else {
      if (startBidCents === null || Number.isNaN(startBidCents) || startBidCents <= 0) {
        return setErr("Starting offer must be greater than 0.");
      }
      if (buyNowCents !== null) {
        if (Number.isNaN(buyNowCents)) return setErr("Buy Now must be a number or blank.");
        if (buyNowCents <= 0) return setErr("Buy Now must be greater than 0 (or blank).");
        if (buyNowCents < startBidCents) return setErr("Buy Now must be >= starting offer.");
      }
    }

    setBusy(true);
    try {
      let uploadedImages: { url: string }[] = [];
      if (files.length > 0) {
        const fd = new FormData();
        for (const f of files.slice(0, 10)) {
          fd.append("files", f);
        }

        const up = await fetch("/api/uploads/images", { method: "POST", body: fd });
        const upText = await up.text();
        let upData: any = null;
        try { upData = JSON.parse(upText); } catch { upData = null; }

        if (!up.ok) {
          const msg = (upData && upData.error) ? String(upData.error) : upText || "Image upload failed. Please try again.";
          setErr(msg);
          return;
        }

        uploadedImages = Array.isArray(upData?.images)
          ? upData.images
              .map(function (img: any) { return img && typeof img.url === "string" ? { url: String(img.url) } : null; })
              .filter(Boolean)
          : [];

        if (uploadedImages.length !== files.slice(0, 10).length) {
          setErr("Some images did not upload correctly. Please try again.");
          return;
        }
      }

      const res = await fetch("/api/listings/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: isTimedOffers ? "OFFERABLE" : "BUY_NOW",
          title: t,
          description: d,
          category,
          condition: condition.trim(),
          location: loc,
          price: isTimedOffers ? null : fixedPriceCents,
          startingBid: isTimedOffers ? startBidCents : null,
          reservePrice: isTimedOffers ? reserveCents : null,
          buyNowPrice: isTimedOffers ? buyNowCents : null,
          durationDays: isTimedOffers ? Number(durationDays) : null,
          images: uploadedImages,
        }),
      });

      if (res.status === 401) {
        router.push("/auth/login?next=/sell/new");
        return;
      }

      const text = await res.text().catch(() => "");
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }

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
          reason === "AGE_NOT_VERIFIED" ? "Your account isn't age-verified yet. Please complete age verification to list items." :
          reason === "UNDER_18" ? "Bidra accounts are 18+ only. You can browse publicly, but you can't list or make offers." :
          reason === "POLICY_BLOCKED" ? "Your account is temporarily restricted. Please try again later." :
          "You can't create a listing right now.";
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
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setBusy(false);
    }
  }

  return (
    <div className="bd-card p-5">
      <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="text-sm font-semibold text-blue-900">Arrange fulfillment after purchase</div>
        <div className="mt-1 text-xs text-blue-900">
          Sellers do not need to lock exact meetup, delivery, or postage details before sale. Arrange them with the buyer after purchase.
        </div>
      </div>

      <p className="mt-2 text-sm bd-ink2">
        Add the basics - title, description, category, condition, location, photos, and pricing. Pickup, delivery, or postage can be arranged after purchase.
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
              <Link href={feedbackGate.feedbackUrl} className="bd-btn bd-btn-primary text-center">
                Leave feedback to continue
              </Link>
              <Link href="/orders" className="bd-btn bd-btn-ghost text-center">
                Go to Orders
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} onChangeCapture={clearErrOnEdit} className="mt-6 grid gap-4">
        <div>
          <label className="text-sm font-medium">Sale type</label>
          <select
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as ListingTypeUI)}
          >
            <option value="BUY_NOW">Buy Now</option>
            <option value="TIMED_OFFERS">Timed offers (seller decides at end)</option>
          </select>
          <div className="mt-2 text-xs bd-ink2" data-testid="listing-type-help">
            {isTimedOffers ? (
              <>
                <div className="font-medium text-[var(--bidra-ink)]">Timed offers (not automatic)</div>
                <div className="mt-1">
                  Buyers can place offers until the timer ends. When it ends, you choose whether to proceed with the highest offer - nothing is sold automatically. Reserve is not part of this launch version.
                  You can also add an optional <span className="font-medium">Buy Now</span> price.
                </div>
              </>
            ) : (
              <>
                <div className="font-medium text-[var(--bidra-ink)]">Fixed price (Buy Now)</div>
                <div className="mt-1">
                  You set a price buyers can purchase for immediately via <span className="font-medium">Buy Now</span>. You can still message buyers, but Buy Now is the fastest path to a sale.
                </div>
              </>
            )}
            <div className="mt-1">
              <Link href="/how-it-works" className="underline underline-offset-2">How it works</Link>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Title</label>
          <input className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={"What is it? What condition is it in? What is included? Pickup or postage details."} />
          <div className="mt-2 text-xs bd-ink2">
            Keep it simple: what it is, condition, what is included, and pickup or postage details. No need to repeat category or suburb if those are already filled in.
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="bd-btn bd-btn-ghost rounded-full px-4 py-2 text-sm font-semibold"
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
              Fill example
            </button>
            <span className="text-xs bd-ink2">Adds a simple example you can edit.</span>
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold bd-ink">Category</div>
          <div className="mt-1 text-xs bd-ink2">
            Pick the main category first, then the closest subcategory.
          </div>

          {suggestedCategory && suggestedCategory.categoryLabel !== category ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs bd-ink2">
              <span>Suggested: <span className="font-semibold bd-ink">{suggestedCategory.categoryLabel}</span></span>
              <button
                type="button"
                className="bd-btn bd-btn-ghost rounded-full px-4 py-2 text-sm font-semibold"
                onClick={() => {
                  setCategoryTouched(true);
                  setTopCategoryKey(suggestedCategory.categoryKey);
                  setSubcategoryKey(suggestedCategory.subcategoryKey || "");
                }}
              >
                Use suggestion
              </button>
            </div>
          ) : null}

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Top category</label>
              <select
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                value={topCategoryKey}
                onChange={(e) => {
                  setCategoryTouched(true);
                  setTopCategoryKey(e.target.value);
                  setSubcategoryKey("");
                }}
              >
                <option value="">Select top category...</option>
                {BIDRA_CATEGORIES.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Subcategory</label>
              <select
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                value={subcategoryKey}
                onChange={(e) => {
                  setCategoryTouched(true);
                  setSubcategoryKey(e.target.value);
                }}
                disabled={!selectedCategory}
              >
                <option value="">{selectedCategory ? "Select subcategory..." : "Choose top category first"}</option>
                {selectedCategory ? selectedCategory.subcategories.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                )) : null}
              </select>
            </div>
          </div>

          {category ? (
            <div className="mt-3 rounded-lg border border-black/10 bg-[var(--bidra-bg)] px-3 py-2 text-sm">
              <span className="text-xs uppercase tracking-wide text-black/50">Selected</span>
              <div className="mt-1 font-medium bd-ink">{category}</div>
            </div>
          ) : null}
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
          <input className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="4000 Brisbane, QLD" />
          <p className="mt-1 text-xs text-black/60">
            Defaults to your Account location. Change it for this listing if needed (e.g. selling for family). Format: 4000 Brisbane, QLD.
          </p>
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
              <div className="mt-2 rounded-lg border border-black/10 bg-white px-3 py-3 text-sm bd-ink2">
                Reserve is not available in this launch version.
              </div>
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
              </select>
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium">Photos</label>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="bd-btn bd-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold"
              onClick={() => cameraInputRef.current?.click()}
            >
              Take photo
            </button>

            <button
              type="button"
              className="bd-btn bd-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold"
              onClick={() => galleryInputRef.current?.click()}
            >
              Add photos
            </button>

            <div className="text-xs bd-ink2">{files.length}/10 selected (minimum 1, max 8MB each)</div>
          </div>

          <input
            ref={cameraInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => { addPicked(Array.from(e.target.files || [])); e.currentTarget.value = ""; }}
          />

          <input
            ref={galleryInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => { addPicked(Array.from(e.target.files || [])); e.currentTarget.value = ""; }}
          />

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((p, idx) => (
                <div key={p.url} className="relative h-24 overflow-hidden rounded-md border">
                  <button
                    type="button"
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold bd-ink shadow"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    -
                  </button>
                  <Image src={p.url} alt={p.name} fill unoptimized className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={busy || !canSubmit} className="bd-btn bd-btn-primary text-center disabled:opacity-60">
          {busy ? "Creating..." : "Create listing"}
        </button>
      </form>
    </div>
  );
}
