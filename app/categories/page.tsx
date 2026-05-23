import Link from "next/link";

const categoryGroups = [
  {
    title: "Vehicles",
    href: "/listings?category=vehicles",
    description: "Cars, bikes, parts and transport gear.",
    count: "Browse vehicles",
    subcategories: [
      { label: "Cars", href: "/listings?category=vehicles&query=cars" },
      { label: "Motorbikes", href: "/listings?category=vehicles&query=motorbikes" },
      { label: "Bicycles", href: "/listings?category=vehicles&query=bicycles" },
      { label: "Parts & accessories", href: "/listings?category=vehicles&query=parts" },
    ],
  },
  {
    title: "Home & Living",
    href: "/listings?category=home-and-living",
    description: "Furniture, appliances, decor and household items.",
    count: "Browse home items",
    subcategories: [
      { label: "Furniture", href: "/listings?category=home-and-living&query=furniture" },
      { label: "Appliances", href: "/listings?category=home-and-living&query=appliances" },
      { label: "Tools", href: "/listings?category=home-and-living&query=tools" },
      { label: "Garden", href: "/listings?category=home-and-living&query=garden" },
    ],
  },
  {
    title: "Electronics",
    href: "/listings?category=electronics",
    description: "Phones, laptops, gaming, cameras and tech.",
    count: "Browse electronics",
    subcategories: [
      { label: "Phones", href: "/listings?category=electronics&query=phone" },
      { label: "Computers", href: "/listings?category=electronics&query=laptop" },
      { label: "Gaming", href: "/listings?category=electronics&query=gaming" },
      { label: "Cameras", href: "/listings?category=electronics&query=camera" },
    ],
  },
  {
    title: "Sports & Outdoors",
    href: "/listings?category=sports-and-outdoors",
    description: "Fitness, camping, bikes and outdoor gear.",
    count: "Browse sport gear",
    subcategories: [
      { label: "Fitness", href: "/listings?category=sports-and-outdoors&query=fitness" },
      { label: "Camping", href: "/listings?category=sports-and-outdoors&query=camping" },
      { label: "Bikes", href: "/listings?category=sports-and-outdoors&query=bike" },
      { label: "Fishing", href: "/listings?category=sports-and-outdoors&query=fishing" },
    ],
  },
  {
    title: "Fashion",
    href: "/listings?category=fashion",
    description: "Clothing, shoes, bags and accessories.",
    count: "Browse fashion",
    subcategories: [
      { label: "Clothing", href: "/listings?category=fashion&query=clothing" },
      { label: "Shoes", href: "/listings?category=fashion&query=shoes" },
      { label: "Bags", href: "/listings?category=fashion&query=bags" },
      { label: "Accessories", href: "/listings?category=fashion&query=accessories" },
    ],
  },
  {
    title: "Kids & Baby",
    href: "/listings?category=kids-and-baby",
    description: "Prams, toys, clothes and family essentials.",
    count: "Browse kids items",
    subcategories: [
      { label: "Prams", href: "/listings?category=kids-and-baby&query=pram" },
      { label: "Toys", href: "/listings?category=kids-and-baby&query=toys" },
      { label: "Baby clothes", href: "/listings?category=kids-and-baby&query=baby clothes" },
      { label: "Nursery", href: "/listings?category=kids-and-baby&query=nursery" },
    ],
  },
  {
    title: "Business & Industrial",
    href: "/listings?category=business-and-industrial",
    description: "Equipment, supplies, tools and work gear.",
    count: "Browse business gear",
    subcategories: [
      { label: "Machinery", href: "/listings?category=business-and-industrial&query=machinery" },
      { label: "Office", href: "/listings?category=business-and-industrial&query=office" },
      { label: "Trade tools", href: "/listings?category=business-and-industrial&query=trade tools" },
      { label: "Supplies", href: "/listings?category=business-and-industrial&query=supplies" },
    ],
  },
  {
    title: "Books & Media",
    href: "/listings?category=books-and-media",
    description: "Books, games, music, films and collectables.",
    count: "Browse media",
    subcategories: [
      { label: "Books", href: "/listings?category=books-and-media&query=books" },
      { label: "Games", href: "/listings?category=books-and-media&query=games" },
      { label: "Music", href: "/listings?category=books-and-media&query=music" },
      { label: "Collectables", href: "/listings?category=books-and-media&query=collectables" },
    ],
  },
  {
    title: "Other",
    href: "/listings?category=other",
    description: "Everything else from local sellers.",
    count: "Browse other",
    subcategories: [
      { label: "Freebies", href: "/listings?category=other&query=free" },
      { label: "Wanted", href: "/listings?category=other&query=wanted" },
      { label: "Local finds", href: "/listings?category=other&query=local" },
      { label: "Miscellaneous", href: "/listings?category=other&query=misc" },
    ],
  },
];

const popularLinks = [
  { label: "New listings", href: "/listings?sort=newest" },
  { label: "Near me", href: "/listings" },
  { label: "Buy now", href: "/listings?type=buy-now" },
  { label: "Make an offer", href: "/listings?type=offerable" },
  { label: "Sell an item", href: "/sell/new" },
];

export default function CategoriesPage() {
  return (
    <main className="mx-auto w-full max-w-[1320px] px-6 py-8 text-[#0F172A] sm:px-8 lg:px-10">
      <section className="rounded-[34px] border border-[#C7D2FE] bg-[linear-gradient(135deg,#FFFFFF_0%,#EEF2FF_55%,#F5F3FF_100%)] p-7 shadow-[0_24px_70px_rgba(79,70,229,0.10)] sm:p-9">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-[#475569]">Browse Bidra</div>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="text-5xl font-black leading-none tracking-[-0.06em] text-[#0F172A] sm:text-6xl">Categories</h1>
            <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[#475569]">Browse local marketplace categories, narrow by common item types, or jump straight into all active listings.</p>
          </div>
          <div className="rounded-[24px] border border-[#C7D2FE] bg-white/80 p-4 shadow-sm">
            <div className="text-sm font-black text-[#0F172A]">Popular searches</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {popularLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-full border border-[#C7D2FE] bg-white px-3 py-2 text-sm font-black text-[#4F46E5] hover:bg-[#EEF2FF]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="hidden rounded-[28px] border border-[#D8E1F0] bg-white p-5 shadow-sm lg:block">
          <div className="text-sm font-black uppercase tracking-[0.16em] text-[#475569]">All categories</div>
          <nav className="mt-4 space-y-1">
            {categoryGroups.map((category) => (
              <Link key={category.href} href={category.href} className="block rounded-2xl px-4 py-3 text-sm font-black text-[#4F46E5] hover:bg-[#EEF2FF]">
                {category.title}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-[#E2E8F0] pt-5">
            <Link href="/listings" className="bd-btn bd-btn-primary w-full justify-center rounded-2xl">Browse all listings</Link>
            <Link href="/sell/new" className="bd-btn bd-btn-secondary mt-3 w-full justify-center rounded-2xl">Sell an item</Link>
          </div>
        </aside>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categoryGroups.map((category) => (
            <section key={category.href} className="rounded-[28px] border border-[#D8E1F0] bg-white p-6 shadow-sm transition hover:-translate-y-[2px] hover:border-[#C7D2FE] hover:shadow-[0_18px_50px_rgba(79,70,229,0.10)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={category.href} className="text-2xl font-black tracking-[-0.04em] text-[#0F172A] hover:text-[#4F46E5]">
                    {category.title}
                  </Link>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#475569]">{category.description}</p>
                </div>
                <Link href={category.href} className="shrink-0 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1.5 text-xs font-black text-[#4F46E5]">
                  View
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {category.subcategories.map((subcategory) => (
                  <Link key={subcategory.href} href={subcategory.href} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm font-bold text-[#334155] hover:border-[#C7D2FE] hover:bg-[#F5F3FF] hover:text-[#4F46E5]">
                    {subcategory.label}
                  </Link>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">{category.count}</span>
                <Link href={category.href} className="text-sm font-black text-[#4F46E5] hover:text-[#4338CA]">See all</Link>
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
