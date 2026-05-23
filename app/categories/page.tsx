import Link from "next/link";

const categories = [
  { title: "Electronics", href: "/listings/c/electronics", description: "Phones, laptops, consoles, cameras and tech." },
  { title: "Home & Garden", href: "/listings/c/home-garden", description: "Furniture, appliances, tools and household items." },
  { title: "Vehicles", href: "/listings/c/vehicles", description: "Cars, bikes, parts and accessories." },
  { title: "Fashion", href: "/listings/c/fashion", description: "Clothing, shoes, bags and accessories." },
  { title: "Sport & Outdoors", href: "/listings/c/sport-outdoors", description: "Fitness, camping, bikes and outdoor gear." },
  { title: "Collectables", href: "/listings/c/collectables", description: "Rare finds, hobbies, games and memorabilia." },
  { title: "Baby & Kids", href: "/listings/c/baby-kids", description: "Prams, toys, clothes and family essentials." },
  { title: "All listings", href: "/listings", description: "Browse every active Bidra listing." },
];

export default function CategoriesPage() {
  return (
    <main className="mx-auto w-full max-w-[1320px] px-8 py-10 text-[#0F172A]">
      <section className="rounded-[32px] border border-[#C7D2FE] bg-[linear-gradient(135deg,#FFFFFF_0%,#EEF2FF_58%,#F5F3FF_100%)] p-8 shadow-[0_22px_60px_rgba(79,70,229,0.08)]">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-[#475569]">Browse Bidra</div>
        <h1 className="mt-3 text-5xl font-black tracking-[-0.055em] text-[#0F172A]">Categories</h1>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[#475569]">Find local listings by category, then buy now, make an offer, save items or message sellers.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/listings" className="bd-btn bd-btn-primary rounded-2xl px-6">Browse all listings</Link>
          <Link href="/sell/new" className="bd-btn bd-btn-secondary rounded-2xl px-6">Sell an item</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.href} href={category.href} className="rounded-[24px] border border-[#D8E1F0] bg-white p-6 shadow-sm transition hover:-translate-y-[2px] hover:border-[#C7D2FE] hover:bg-[#F5F3FF]">
            <h2 className="text-xl font-black text-[#0F172A]">{category.title}</h2>
            <p className="mt-3 min-h-16 text-sm font-semibold leading-6 text-[#475569]">{category.description}</p>
            <div className="mt-5 text-sm font-black text-[#4F46E5]">View listings</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
