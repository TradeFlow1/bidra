"use client";

import { FULL_CATEGORIES } from "@/lib/categories";

const POPULAR: string[] = [
  "Vehicles",
  "Home & Furniture",
  "Tech & Electronics",
  "Fashion & Wearables",
  "Sports & Outdoors",
  "Kids & Toys",
  "Appliances",
  "Tools & DIY",
  "Books & Media",
  "Collectibles & Vintage",
  "Seasonal Goods",
];

function uniq(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

export default function HomeCategorySelect() {
  const popular = uniq(POPULAR).filter((c) => FULL_CATEGORIES.includes(c as string));
  const all = FULL_CATEGORIES.filter((c) => !popular.includes(c));

  return (
    <select
      aria-label="Browse by category"
      defaultValue=""
      onChange={(e) => {
        const v = (e.target as HTMLSelectElement).value;
        if (!v) return;
        window.location.href = `/listings?category=${encodeURIComponent(v)}`;
      }}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(2,6,23,0.06)",
        fontSize: 15,
        color: "#0F172A",
      }}
    >
      <option value="" disabled>
        Select a category…
      </option>

      {popular.length > 0 ? (
        <>
          <optgroup label="Popular">
            {popular.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
          <optgroup label="All categories">
            {all.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
        </>
      ) : (
        FULL_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))
      )}
    </select>
  );
}
