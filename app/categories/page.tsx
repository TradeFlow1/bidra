import Link from "next/link";

const categories = [
  {
    title: "Cars & Vehicles",
    href: "/listings?category=vehicles",
    description: "Cars, bikes, parts and local transport finds.",
    links: [
      { label: "Cars", href: "/listings?category=vehicles&query=cars" },
      { label: "Motorbikes", href: "/listings?category=vehicles&query=motorbikes" },
      { label: "Bicycles", href: "/listings?category=vehicles&query=bicycles" },
      { label: "Parts", href: "/listings?category=vehicles&query=parts" },
    ],
  },
  {
    title: "Home & Garden",
    href: "/listings?category=home-and-living",
    description: "Furniture, appliances, tools and garden gear.",
    links: [
      { label: "Furniture", href: "/listings?category=home-and-living&query=furniture" },
      { label: "Appliances", href: "/listings?category=home-and-living&query=appliances" },
      { label: "Tools", href: "/listings?category=home-and-living&query=tools" },
      { label: "Garden", href: "/listings?category=home-and-living&query=garden" },
    ],
  },
  {
    title: "Electronics",
    href: "/listings?category=electronics",
    description: "Phones, laptops, gaming, cameras and accessories.",
    links: [
      { label: "Phones", href: "/listings?category=electronics&query=phone" },
      { label: "Laptops", href: "/listings?category=electronics&query=laptop" },
      { label: "Gaming", href: "/listings?category=electronics&query=gaming" },
      { label: "Cameras", href: "/listings?category=electronics&query=camera" },
    ],
  },
  {
    title: "Sports & Outdoors",
    href: "/listings?category=sports-and-outdoors",
    description: "Fitness, camping, bikes, fishing and outdoor gear.",
    links: [
      { label: "Fitness", href: "/listings?category=sports-and-outdoors&query=fitness" },
      { label: "Camping", href: "/listings?category=sports-and-outdoors&query=camping" },
      { label: "Bikes", href: "/listings?category=sports-and-outdoors&query=bike" },
      { label: "Fishing", href: "/listings?category=sports-and-outdoors&query=fishing" },
    ],
  },
  {
    title: "Fashion",
    href: "/listings?category=fashion",
    description: "Clothing, shoes, bags and everyday accessories.",
    links: [
      { label: "Women's clothing", href: "/listings?category=fashion&query=womens clothing" },
      { label: "Men's clothing", href: "/listings?category=fashion&query=mens clothing" },
      { label: "Shoes", href: "/listings?category=fashion&query=shoes" },
      { label: "Bags", href: "/listings?category=fashion&query=bags" },
    ],
  },
  {
    title: "Kids & Baby",
    href: "/listings?category=kids-and-baby",
    description: "Prams, toys, baby clothes and nursery items.",
    links: [
      { label: "Prams", href: "/listings?category=kids-and-baby&query=pram" },
      { label: "Toys", href: "/listings?category=kids-and-baby&query=toys" },
      { label: "Baby clothes", href: "/listings?category=kids-and-baby&query=baby clothes" },
      { label: "Nursery", href: "/listings?category=kids-and-baby&query=nursery" },
    ],
  },
  {
    title: "Business & Industrial",
    href: "/listings?category=business-and-industrial",
    description: "Machinery, office equipment, trade tools and supplies.",
    links: [
      { label: "Machinery", href: "/listings?category=business-and-industrial&query=machinery" },
      { label: "Office", href: "/listings?category=business-and-industrial&query=office" },
      { label: "Trade tools", href: "/listings?category=business-and-industrial&query=trade tools" },
      { label: "Supplies", href: "/listings?category=business-and-industrial&query=supplies" },
    ],
  },
  {
    title: "Books, Games & Media",
    href: "/listings?category=books-and-media",
    description: "Books, games, music and collectable media.",
    links: [
      { label: "Books", href: "/listings?category=books-and-media&query=books" },
      { label: "Games", href: "/listings?category=books-and-media&query=games" },
      { label: "Music", href: "/listings?category=books-and-media&query=music" },
      { label: "Collectables", href: "/listings?category=books-and-media&query=collectables" },
    ],
  },
  {
    title: "Other",
    href: "/listings?category=other",
    description: "Freebies, wanted posts, local finds and miscellaneous items.",
    links: [
      { label: "Freebies", href: "/listings?category=other&query=free" },
      { label: "Wanted", href: "/listings?category=other&query=wanted" },
      { label: "Local finds", href: "/listings?category=other&query=local" },
      { label: "Miscellaneous", href: "/listings?category=other&query=misc" },
    ],
  },
];

const quickLinks = [
  { label: "Browse all listings", href: "/listings" },
  { label: "New listings", href: "/listings?sort=newest" },
  { label: "Buy now", href: "/listings?type=buy-now" },
  { label: "Make an offer", href: "/listings?type=offerable" },
];

export default function CategoriesPage() {
  return (
    <main className="bg-white text-[#07152E]">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-10 sm:px-8">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-6 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4F46E5]">Browse Bidra</div>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-black leading-none tracking-[-0.06em] text-[#07152E] sm:text-6xl">Categories</h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[#475569]">Find local items faster. Start with a category, then narrow by item type, location and price.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/listings" className="bd-btn bd-btn-primary rounded-2xl px-6">Browse all listings</Link>
              <Link href="/sell/new" className="bd-btn bd-btn-secondary rounded-2xl bg-white px-6">Sell an item</Link>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-[#D8E1F0] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-2 text-sm font-black text-[#4F46E5] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.045em] text-[#07152E]">Shop by category</h2>
              <p className="mt-2 text-sm font-semibold text-[#64748B]">Popular sections for buying, offers and local discovery.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <section key={category.href} className="flex min-h-[230px] flex-col rounded-[28px] border border-[#D8E1F0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.10)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={category.href} className="text-xl font-black tracking-[-0.035em] text-[#07152E] hover:text-[#4F46E5]">
                      {category.title}
                    </Link>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">{category.description}</p>
                  </div>
                  <Link href={category.href} className="shrink-0 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-xs font-black text-[#4F46E5]">View</Link>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {category.links.map((link) => (
                    <Link key={link.href} href={link.href} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm font-bold text-[#4F46E5] transition hover:bg-white hover:text-[#4338CA] hover:shadow-sm">
                      {link.label}
                    </Link>
                  ))}
                </div>

                <Link href={category.href} className="mt-auto pt-5 text-sm font-black text-[#4F46E5] hover:text-[#4338CA]">
                  See all in {category.title} →
                </Link>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
