import Link from "next/link";

const categories = [
  {
    title: "Cars & Vehicles",
    href: "/listings?category=vehicles",
    links: [
      { label: "Cars", href: "/listings?category=vehicles&query=cars" },
      { label: "Motorbikes", href: "/listings?category=vehicles&query=motorbikes" },
      { label: "Bicycles", href: "/listings?category=vehicles&query=bicycles" },
      { label: "Parts & accessories", href: "/listings?category=vehicles&query=parts" },
    ],
  },
  {
    title: "Home & Garden",
    href: "/listings?category=home-and-living",
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
    links: [
      { label: "Phones", href: "/listings?category=electronics&query=phone" },
      { label: "Computers & laptops", href: "/listings?category=electronics&query=laptop" },
      { label: "Gaming", href: "/listings?category=electronics&query=gaming" },
      { label: "Cameras", href: "/listings?category=electronics&query=camera" },
    ],
  },
  {
    title: "Sports & Outdoors",
    href: "/listings?category=sports-and-outdoors",
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
    links: [
      { label: "Women's clothing", href: "/listings?category=fashion&query=womens clothing" },
      { label: "Men's clothing", href: "/listings?category=fashion&query=mens clothing" },
      { label: "Shoes", href: "/listings?category=fashion&query=shoes" },
      { label: "Bags & accessories", href: "/listings?category=fashion&query=bags" },
    ],
  },
  {
    title: "Kids & Baby",
    href: "/listings?category=kids-and-baby",
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
    links: [
      { label: "Machinery", href: "/listings?category=business-and-industrial&query=machinery" },
      { label: "Office equipment", href: "/listings?category=business-and-industrial&query=office" },
      { label: "Trade tools", href: "/listings?category=business-and-industrial&query=trade tools" },
      { label: "Supplies", href: "/listings?category=business-and-industrial&query=supplies" },
    ],
  },
  {
    title: "Books, Games & Media",
    href: "/listings?category=books-and-media",
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
    <main className="mx-auto w-full max-w-[1180px] px-6 py-10 text-[#0F172A] sm:px-8">
      <section className="border-b border-[#E2E8F0] pb-8">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4F46E5]">Browse Bidra</div>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-black leading-none tracking-[-0.06em] text-[#0F172A] sm:text-6xl">Categories</h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[#475569]">
              Find local items faster. Browse major categories, popular searches, or jump straight into all listings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/listings" className="bd-btn bd-btn-primary rounded-2xl px-6">Browse all listings</Link>
            <Link href="/sell/new" className="bd-btn bd-btn-secondary rounded-2xl px-6">Sell an item</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-8 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[24px] border border-[#D8E1F0] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#475569]">Quick links</h2>
            <div className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-2xl px-4 py-3 text-sm font-black text-[#4F46E5] hover:bg-[#EEF2FF]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.045em] text-[#0F172A]">All categories</h2>
              <p className="mt-2 text-sm font-semibold text-[#64748B]">Choose a section, then narrow by common item type.</p>
            </div>
          </div>

          <div className="divide-y divide-[#E2E8F0] rounded-[28px] border border-[#D8E1F0] bg-white shadow-sm">
            {categories.map((category) => (
              <section key={category.href} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[230px_1fr_90px] lg:items-start">
                <div>
                  <Link href={category.href} className="text-xl font-black tracking-[-0.035em] text-[#0F172A] hover:text-[#4F46E5]">
                    {category.title}
                  </Link>
                </div>

                <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {category.links.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm font-bold leading-6 text-[#4F46E5] hover:text-[#4338CA] hover:underline">
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="lg:text-right">
                  <Link href={category.href} className="text-sm font-black text-[#4F46E5] hover:text-[#4338CA]">
                    See all
                  </Link>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
