export const CATEGORY_TREE = {
  "Vehicles": [
    "Cars",
    "Motorcycles",
    "Trucks & Commercial",
    "Boats & Marine",
    "Caravans & Campers",
    "Vehicle Parts & Accessories",
  ],

  "Home & Furniture": [
    "Living Room",
    "Bedroom",
    "Dining",
    "Outdoor & Garden",
    "Office Furniture",
    "Storage",
    "Home Decor",
  ],

  "Appliances": [
    "Kitchen Appliances",
    "Laundry Appliances",
    "Heating & Cooling",
    "Vacuums",
  ],

  "Tools & DIY": [
    "Power Tools",
    "Hand Tools",
    "Garden Tools",
    "Building Materials",
  ],

  "Tech & Electronics": [
    "Phones & Accessories",
    "Computers",
    "Gaming",
    "TV & Audio",
    "Cameras",
  ],

  "Fashion & Wearables": [
    "Men's Clothing",
    "Women's Clothing",
    "Shoes",
    "Bags",
    "Jewellery & Watches",
  ],

  "Beauty & Personal Care": [
    "Skincare",
    "Hair Care",
    "Fragrances",
    "Grooming",
  ],

  "Sports & Outdoors": [
    "Fitness",
    "Camping",
    "Cycling",
    "Fishing",
    "Water Sports",
  ],

  "Kids & Toys": [
    "Toys",
    "Games",
    "Kids Clothing",
  ],

  "Baby & Nursery": [
    "Prams",
    "Car Seats",
    "Nursery Furniture",
  ],

  "Books & Media": [
    "Books",
    "Movies",
    "Music",
    "Games",
  ],

  "Collectibles & Vintage": [
    "Coins",
    "Trading Cards",
    "Memorabilia",
    "Antiques",
  ],

  "Art": [
    "Paintings",
    "Sculpture",
    "Photography",
  ],

  "Office & Business": [
    "Office Equipment",
    "Supplies",
    "POS & Retail",
  ],

  "Industrial": [
    "Machinery",
    "Electrical",
    "Safety Equipment",
  ],

  "Pet Supplies (NO LIVE ANIMALS)": [
    "Food",
    "Accessories",
    "Beds & Carriers",
  ],

  "Health & Medical (non-prescription)": [
    "Mobility",
    "Monitoring Devices",
    "Wellness",
  ],

  "Tickets (where permitted)": [
    "Events",
    "Sport",
    "Theatre",
  ],

  "Services": [
    "Trade Services",
    "Creative Services",
    "Lessons",
  ],

  "Free items": [],

  "Other": [],
} as const;

export const PARENT_CATEGORIES = Object.keys(CATEGORY_TREE) as readonly string[];

export const CATEGORY_GROUPS = Object.entries(CATEGORY_TREE).map(([parent, children]) => ({
  parent,
  children: Array.from(children),
})) as readonly { parent: string; children: readonly string[] }[];



export const CATEGORY_SEPARATOR = " › " as const;

export function joinCategory(parent: string, child?: string) {
  const p = String(parent || "").trim();
  const c = String(child || "").trim();
  if (!p) return "";
  if (!c) return p;
  return `${p}${CATEGORY_SEPARATOR}${c}`;
}

export function getCategoryParent(value: string) {
  const v = String(value || "");
  const i = v.indexOf(CATEGORY_SEPARATOR);
  return i >= 0 ? v.slice(0, i) : v;
}

export function getCategoryChild(value: string) {
  const v = String(value || "");
  const i = v.indexOf(CATEGORY_SEPARATOR);
  return i >= 0 ? v.slice(i + CATEGORY_SEPARATOR.length) : "";
}
// Flattened list for legacy UI compatibility
export const FULL_CATEGORIES = Object.entries(CATEGORY_TREE).flatMap(([parent, children]) =>
  children.length ? [parent, ...children.map((c) => joinCategory(parent, c))] : [parent]
) as readonly string[];

export type Category = (typeof FULL_CATEGORIES)[number];
