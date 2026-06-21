import Link from "next/link";
import { prisma } from "@/lib/prisma";

function money(cents: number | null | undefined) {
  if (typeof cents !== "number" || !Number.isFinite(cents)) return "-";
  return "$" + (cents / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function timeLabel(value: Date) {
  const diff = value.getTime() - Date.now();
  if (diff <= 0) return "Window ended";
  if (diff <= 60 * 60 * 1000) return "Closing within 1 hour";
  if (diff <= 24 * 60 * 60 * 1000) return "Closing today";
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  return `Closing in ${days} ${days === 1 ? "day" : "days"}`;
}

export default async function ClosingSoonFeed() {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const offers = await prisma.offer.findMany({
    where: {
      expiresAt: { gt: now, lte: soon },
      listing: {
        status: "ACTIVE",
        type: "OFFERABLE",
        orders: { none: {} },
      },
    },
    orderBy: { expiresAt: "asc" },
    distinct: ["listingId"],
    take: 6,
    select: {
      id: true,
      expiresAt: true,
      displayAmount: true,
      amount: true,
      listing: {
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
          currentOfferAmount: true,
          _count: { select: { offers: true } },
        },
      },
    },
  }).catch(() => []);

  if (!offers.length) return null;

  return (
    <section className="rounded-[28px] border border-[#C7D2FE] bg-[#F8FAFF] p-5 shadow-sm sm:p-7" id="closing-soon-feed">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4F46E5]">Closing soon</div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-[#0F172A] sm:text-3xl">Timed offers closing soon</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#475569]">
            Offer windows with active buyer interest. Sellers still choose whether to accept an offer; Bidra does not automatically sell the item.
          </p>
        </div>
        <Link href="/listings?type=OFFERABLE" className="inline-flex h-11 w-fit items-center rounded-2xl border border-[#C7D2FE] bg-white px-4 text-sm font-black text-[#4F46E5] shadow-sm">
          Browse timed offers
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => {
          const listing = offer.listing;
          const visibleAmount = typeof listing.currentOfferAmount === "number"
            ? listing.currentOfferAmount
            : (typeof offer.displayAmount === "number" ? offer.displayAmount : offer.amount);

          return (
            <Link key={offer.id} href={`/listings/${listing.id}`} className="block rounded-[22px] border border-[#D8E1F0] bg-white p-4 shadow-sm transition hover:border-[#C7D2FE] hover:bg-[#EEF2FF]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-[#07152E]">{listing.title}</div>
                  <div className="mt-1 truncate text-xs font-bold text-[#64748B]">{listing.location || "Australia"}</div>
                </div>
                <span className="shrink-0 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-black text-[#3730A3]">
                  {timeLabel(offer.expiresAt)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-[#64748B]">
                <div className="rounded-2xl bg-[#F8FAFC] p-3">
                  <div>Visible offer</div>
                  <div className="mt-1 text-base font-black text-[#07152E]">{money(visibleAmount)}</div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-3">
                  <div>Offer activity</div>
                  <div className="mt-1 text-base font-black text-[#07152E]">{listing._count.offers}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
