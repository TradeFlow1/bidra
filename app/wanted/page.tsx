import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/ui/back-button";
import { EmptyMarketplaceState, ReferencePage, appShell } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";

function formatBudget(min?: number | null, max?: number | null) {
  const fmt = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
  if (typeof min === "number" && typeof max === "number") return `${fmt.format(min / 100)} - ${fmt.format(max / 100)}`;
  if (typeof max === "number") return `Up to ${fmt.format(max / 100)}`;
  if (typeof min === "number") return `From ${fmt.format(min / 100)}`;
  return "Budget open";
}

function formatAge(date: Date) {
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000)));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  return `Posted ${days} days ago`;
}

export default async function WantedAdsPage({ searchParams = {} }: { searchParams?: { category?: string; location?: string } }) {
  const selectedCategory = String(searchParams.category || "").trim();
  const selectedLocation = String(searchParams.location || "").trim();

  const where: any = {
    status: "ACTIVE",
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };

  if (selectedCategory) where.category = { contains: selectedCategory, mode: "insensitive" };
  if (selectedLocation) where.location = { contains: selectedLocation, mode: "insensitive" };

  const wantedAds = await prisma.wantedAd.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      budgetMin: true,
      budgetMax: true,
      createdAt: true,
      buyer: { select: { username: true, name: true, createdAt: true, emailVerified: true, phoneVerified: true } },
    },
  });

  return (
    <ReferencePage>
      <div className={appShell + " py-5 sm:py-7"}>
        <BackButton href="/listings" label="Back to listings" />
        <section className="mt-4 rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0B4DFF]">Wanted ads</div>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">See what buyers want</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#36506F] sm:text-base">Wanted ads show buyer demand. Sellers can browse requests, create normal listings for matching items and arrange questions or handover through Bidra Messages.</p>
          <div className="mt-5 flex flex-wrap gap-2"><Link href="/wanted/new" className="bd-btn bd-btn-primary text-center">Post wanted ad</Link><Link href="/sell/new" className="bd-btn bd-btn-secondary text-center">Create listing</Link><Link href="/listings" className="bd-btn bd-btn-secondary text-center">Browse listings</Link></div>
        </section>

        <section className="mt-5 rounded-[28px] border border-[#D8E6F8] bg-white p-4 shadow-sm">
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" action="/wanted">
            <input name="category" defaultValue={selectedCategory} className="h-11 rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Category" />
            <input name="location" defaultValue={selectedLocation} className="h-11 rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Location" />
            <button className="h-11 rounded-2xl bg-[#4F46E5] px-5 text-sm font-black text-white">Filter</button>
          </form>
        </section>

        <section className="mt-5">
          {wantedAds.length === 0 ? (
            <EmptyMarketplaceState title="No active wanted ads yet" body="Post a wanted ad to show sellers what you are looking for, or browse current listings." href="/wanted/new" cta="Post wanted ad" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {wantedAds.map((item) => (
                <article key={item.id} className="rounded-[28px] border border-[#D8E6F8] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#4F46E5]"><span className="rounded-full bg-[#EEF2FF] px-3 py-1">{item.category}</span><span className="rounded-full bg-[#F8FAFF] px-3 py-1">{item.location}</span></div>
                  <h2 className="mt-3 text-xl font-black tracking-tight text-[#07152E]">{item.title}</h2>
                  <p className="mt-2 line-clamp-4 text-sm font-semibold leading-6 text-[#526173]">{item.description}</p>
                  <div className="mt-4 grid gap-2 text-sm font-bold text-[#334155]"><span>{formatBudget(item.budgetMin, item.budgetMax)}</span><span>{formatAge(item.createdAt)}</span></div>
                  <div className="mt-4 rounded-2xl border border-[#D8E6F8] bg-[#F8FAFF] p-3 text-xs font-semibold leading-5 text-[#526173]">Have a matching item? Create a normal listing, then keep questions and handover details in Bidra Messages.</div>
                  <div className="mt-4 flex flex-wrap gap-2"><Link href={`/sell/new?wanted=${item.id}`} className="bd-btn bd-btn-primary text-center">List matching item</Link><Link href={`/listings?category=${encodeURIComponent(item.category)}&location=${encodeURIComponent(item.location)}`} className="bd-btn bd-btn-secondary text-center">Search listings</Link></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </ReferencePage>
  );
}
