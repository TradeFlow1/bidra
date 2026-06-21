import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function ageLabel(value: Date) {
  const days = Math.max(0, Math.floor((Date.now() - value.getTime()) / (24 * 60 * 60 * 1000)));
  if (days === 0) return "Listed today";
  if (days === 1) return "1 day live";
  return `${days} days live`;
}

function suggestionFor(listing: {
  status: string;
  viewCount: number;
  _count: { watchlist: number; offers: number; questions: number };
}) {
  if (listing.status !== "ACTIVE") return "Review status before relisting or updating this item.";
  if (listing.viewCount >= 20 && listing._count.offers === 0) return "Strong views but no offers yet. Check photos, price and handover details.";
  if (listing._count.watchlist >= 3 && listing._count.offers === 0) return "People are saving this item. Consider clearer details or a sharper Buy Now price.";
  if (listing._count.questions > 0) return "Public questions show buyer interest. Add missing details to the description.";
  if (listing._count.offers > 0) return "Offer activity is active. Keep replies clear and arrange next steps in Messages.";
  return "Keep photos, condition and pickup or postage details clear to improve buyer confidence.";
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#DCE5F2] bg-[#F8FAFF] p-4 shadow-sm">
      <div className="text-2xl font-black tracking-[-0.04em] text-[#07152E]">{value.toLocaleString("en-AU")}</div>
      <div className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">{label}</div>
    </div>
  );
}

export default async function SellerAnalyticsPanel() {
  const session = await auth();
  const userId = session?.user?.id || "";
  if (!userId) return null;

  const listings = await prisma.listing.findMany({
    where: { sellerId: userId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: {
      id: true,
      title: true,
      status: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      currentOfferAmount: true,
      _count: {
        select: {
          watchlist: true,
          offers: true,
          questions: true,
          messages: true,
        },
      },
    },
  });

  if (!listings.length) return null;

  const totalViews = listings.reduce((sum, item) => sum + Number(item.viewCount || 0), 0);
  const totalSaves = listings.reduce((sum, item) => sum + Number(item._count.watchlist || 0), 0);
  const totalOffers = listings.reduce((sum, item) => sum + Number(item._count.offers || 0), 0);
  const totalQuestions = listings.reduce((sum, item) => sum + Number(item._count.questions || 0), 0);

  return (
    <section id="seller-analytics" className="bg-white px-4 pb-6 text-[#0F172A] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="rounded-[24px] border border-[#DCE5F2] bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F46E5]">Seller analytics</div>
              <h2 className="mt-1 text-2xl font-black tracking-tight">Listing performance</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#64748B]">
                Track views, saves, offers and public questions so sellers can improve listings before messaging or handover.
              </p>
            </div>
            <Link href="/sell/new" className="inline-flex h-11 w-fit items-center rounded-2xl border border-[#C7D2FE] bg-white px-4 text-sm font-black text-[#4F46E5] shadow-sm">
              Create listing
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Views" value={totalViews} />
            <MetricCard label="Saves" value={totalSaves} />
            <MetricCard label="Offers" value={totalOffers} />
            <MetricCard label="Public questions" value={totalQuestions} />
          </div>

          <div className="mt-5 divide-y divide-[#E2E8F0] overflow-hidden rounded-2xl border border-[#E2E8F0]">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="block p-4 transition hover:bg-[#F8FAFF]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-[#07152E]">{listing.title}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold text-[#64748B]">
                      <span>{listing.status}</span>
                      <span>{ageLabel(listing.createdAt)}</span>
                      <span>{listing._count.messages} message starts</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#475569]">{suggestionFor(listing)}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-black text-[#64748B] lg:min-w-[360px]">
                    <div className="rounded-2xl bg-[#F8FAFC] p-3"><div className="text-base text-[#07152E]">{listing.viewCount}</div><div>Views</div></div>
                    <div className="rounded-2xl bg-[#F8FAFC] p-3"><div className="text-base text-[#07152E]">{listing._count.watchlist}</div><div>Saves</div></div>
                    <div className="rounded-2xl bg-[#F8FAFC] p-3"><div className="text-base text-[#07152E]">{listing._count.offers}</div><div>Offers</div></div>
                    <div className="rounded-2xl bg-[#F8FAFC] p-3"><div className="text-base text-[#07152E]">{listing._count.questions}</div><div>Q&amp;A</div></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
