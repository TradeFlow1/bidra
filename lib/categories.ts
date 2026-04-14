export type BidraLeafCategory = {
  key: string;
  label: string;
};

export type BidraSubcategory = {
  key: string;
  label: string;
  leaves?: BidraLeafCategory[];
};

export type BidraCategory = {
  key: string;
  label: string;
  subcategories: BidraSubcategory[];
};

export const BIDRA_CATEGORIES: BidraCategory[] = [
  {
    key: "vehicles",
    label: "Vehicles",
    subcategories: [
      { key: "cars", label: "Cars" },
      { key: "motorcycles", label: "Motorcycles" },
      { key: "parts", label: "Parts & Accessories" },
      { key: "commercial", label: "Commercial Vehicles" }
    ]
  },
  {
    key: "property",
    label: "Property",
    subcategories: [
      { key: "rentals", label: "Rentals" },
      { key: "home-sales", label: "Home Sales" },
      { key: "commercial", label: "Commercial Property" }
    ]
  },
  {
    key: "electronics",
    label: "Electronics",
    subcategories: [
      { key: "phones", label: "Phones" },
      { key: "computers", label: "Computers" },
      { key: "audio", label: "Audio" },
      { key: "gaming", label: "Gaming" },
      { key: "cameras", label: "Cameras" },
      { key: "tvs", label: "TVs" }
    ]
  },
  {
    key: "home-furniture",
    label: "Home & Furniture",
    subcategories: [
      { key: "sofas", label: "Sofas" },
      { key: "beds", label: "Beds" },
      { key: "tables", label: "Tables" },
      { key: "storage", label: "Storage" },
      { key: "decor", label: "Decor" },
      { key: "lighting", label: "Lighting" }
    ]
  },
  {
    key: "appliances",
    label: "Appliances",
    subcategories: [
      { key: "kitchen", label: "Kitchen Appliances" },
      { key: "laundry", label: "Laundry Appliances" },
      { key: "heating-cooling", label: "Heating & Cooling" }
    ]
  },
  {
    key: "fashion",
    label: "Fashion",
    subcategories: [
      { key: "womens", label: "Womens Fashion" },
      { key: "mens", label: "Mens Fashion" },
      { key: "shoes", label: "Shoes" },
      { key: "bags", label: "Bags & Accessories" },
      { key: "jewellery", label: "Jewellery & Watches" }
    ]
  },
  {
    key: "baby-kids",
    label: "Baby & Kids",
    subcategories: [
      { key: "toys", label: "Toys" },
      { key: "clothing", label: "Kids Clothing" },
      { key: "nursery", label: "Nursery" },
      { key: "prams", label: "Prams & Strollers" }
    ]
  },
  {
    key: "sports-outdoors",
    label: "Sports & Outdoors",
    subcategories: [
      { key: "fitness", label: "Fitness" },
      { key: "camping", label: "Camping" },
      { key: "cycling", label: "Cycling" },
      { key: "team-sports", label: "Team Sports" }
    ]
  },
  {
    key: "tools-diy",
    label: "Tools & DIY",
    subcategories: [
      { key: "power-tools", label: "Power Tools" },
      { key: "hand-tools", label: "Hand Tools" },
      { key: "building-supplies", label: "Building Supplies" },
      { key: "hardware", label: "Hardware" }
    ]
  },
  {
    key: "hobbies-collectibles",
    label: "Hobbies & Collectibles",
    subcategories: [
      { key: "collectibles", label: "Collectibles" },
      { key: "art", label: "Art" },
      { key: "crafts", label: "Crafts" },
      { key: "music", label: "Musical Instruments" }
    ]
  },
  {
    key: "entertainment-media",
    label: "Entertainment & Media",
    subcategories: [
      { key: "books", label: "Books" },
      { key: "movies", label: "Movies" },
      { key: "music", label: "Music" },
      { key: "games", label: "Video Games" }
    ]
  },
  {
    key: "office-business",
    label: "Office & Business",
    subcategories: [
      { key: "office-furniture", label: "Office Furniture" },
      { key: "supplies", label: "Office Supplies" },
      { key: "equipment", label: "Business Equipment" }
    ]
  },
  {
    key: "pet-supplies",
    label: "Pet Supplies",
    subcategories: [
      { key: "dogs", label: "Dogs" },
      { key: "cats", label: "Cats" },
      { key: "tanks", label: "Aquariums & Tanks" },
      { key: "bedding", label: "Pet Bedding & Care" }
    ]
  },
  {
    key: "garden-outdoor",
    label: "Garden & Outdoor",
    subcategories: [
      { key: "plants", label: "Plants" },
      { key: "outdoor-furniture", label: "Outdoor Furniture" },
      { key: "garden-tools", label: "Garden Tools" },
      { key: "bbq", label: "BBQ & Outdoor Cooking" }
    ]
  },
  {
    key: "free-stuff",
    label: "Free Stuff",
    subcategories: [
      { key: "free-items", label: "Free Items" }
    ]
  },
  {
    key: "other",
    label: "Other",
    subcategories: [
      { key: "misc", label: "Miscellaneous" }
    ]
  }
];

export function getTopCategories(): Array<{ key: string; label: string }> {
  return BIDRA_CATEGORIES.map(function (x) {
    return { key: x.key, label: x.label };
  });
}

export function findCategoryByKey(key: string | null | undefined): BidraCategory | null {
  if (!key) return null;
  for (let i = 0; i < BIDRA_CATEGORIES.length; i += 1) {
    if (BIDRA_CATEGORIES[i].key === key) return BIDRA_CATEGORIES[i];
  }
  return null;
}

export function findSubcategory(categoryKey: string | null | undefined, subcategoryKey: string | null | undefined): BidraSubcategory | null {
  const category = findCategoryByKey(categoryKey);
  if (!category || !subcategoryKey) return null;
  for (let i = 0; i < category.subcategories.length; i += 1) {
    if (category.subcategories[i].key === subcategoryKey) return category.subcategories[i];
  }
  return null;
}
export function joinCategory(parent: string, child?: string | null): string {
  const p = String(parent || "").trim();
  const c = String(child || "").trim();
  if (!p) return c;
  if (!c) return p;
  return p + " > " + c;
}

export const CATEGORY_GROUPS: Array<{ parent: string; children: string[] }> = BIDRA_CATEGORIES.map(function (category) {
  return {
    parent: category.label,
    children: category.subcategories.map(function (subcategory) {
      return subcategory.label;
    })
  };
});

export const FULL_CATEGORIES: string[] = (function () {
  const values: string[] = [];
  for (let i = 0; i < BIDRA_CATEGORIES.length; i += 1) {
    const category = BIDRA_CATEGORIES[i];
    values.push(category.label);
    for (let j = 0; j < category.subcategories.length; j += 1) {
      values.push(joinCategory(category.label, category.subcategories[j].label));
    }
  }
  return values;
})();
