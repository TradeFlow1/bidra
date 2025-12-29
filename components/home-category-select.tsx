"use client";

export default function HomeCategorySelect() {
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
      <option value="" disabled>Select a category…</option>
      <option value="Home & Furniture">Home & Furniture</option>
      <option value="Tech & Electronics">Tech & Electronics</option>
      <option value="Fashion & Wearables">Fashion & Wearables</option>
      <option value="Sports & Outdoors">Sports & Outdoors</option>
      <option value="Kids & Toys">Kids & Toys</option>
      <option value="Appliances">Appliances</option>
      <option value="Tools & DIY">Tools & DIY</option>
      <option value="Books & Media">Books & Media</option>
      <option value="Collectibles & Vintage">Collectibles & Vintage</option>
      <option value="Seasonal Goods">Seasonal Goods</option>
    </select>
  );
}
