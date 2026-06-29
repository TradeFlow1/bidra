import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function SellerCard({
  sellerName,
  sellerInitials,
  sellerAvatarUrl,
  sellerLocation,
  sellerJoined,
  sellerBadges,
  sellerFeedbackCount,
  sellerListingCount,
  fulfillmentLabel,
  sellerHref,
  messageAction,
}: {
  sellerName: string;
  sellerInitials: string;
  sellerAvatarUrl: string;
  sellerLocation: string;
  sellerJoined: string;
  sellerBadges: string[];
  sellerFeedbackCount: number;
  sellerListingCount: number;
  fulfillmentLabel: string;
  sellerHref: string;
  messageAction: ReactNode;
}) {
  return (
    <div className="mt-8 rounded-[30px] border border-[#EDE9FE] bg-white p-6 shadow-[0_18px_50px_rgba(43,16,85,0.08)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#DDD6FE] bg-[#F5F3FF] text-2xl font-black text-[#6D28D9] shadow-sm">
            {sellerAvatarUrl ? (
              <Image src={sellerAvatarUrl} alt={sellerName} width={80} height={80} className="h-full w-full object-cover" unoptimized />
            ) : (
              sellerInitials
            )}
          </div>

          <div>
            <div className="text-xl font-black text-[#120724]">{sellerName}</div>
            <div className="mt-1 text-sm font-semibold text-[#62516F]">{sellerLocation}</div>
            <div className="mt-1 text-sm font-semibold text-[#62516F]">Member since {sellerJoined}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sellerBadges.length ? (
                sellerBadges.map((badge) => (
                  <span key={badge} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
                    {badge}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-[#DDD6FE] bg-white px-3 py-1 text-xs font-extrabold text-[#62516F]">
                  Verification pending
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:w-[320px] sm:grid-cols-2">
          <Link href={sellerHref} className="bd-btn bd-btn-secondary h-12 rounded-2xl px-5 text-sm">
            View profile
          </Link>
          {messageAction}
        </div>
      </div>

      <div className="mt-6 grid gap-3 border-t border-[#EDE9FE] pt-5 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#FBF9FF] p-4">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-[#8B7A98]">Feedback</div>
          <div className="mt-1 text-xl font-black text-[#120724]">{sellerFeedbackCount}</div>
        </div>
        <div className="rounded-2xl bg-[#FBF9FF] p-4">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-[#8B7A98]">Listings</div>
          <div className="mt-1 text-xl font-black text-[#120724]">{sellerListingCount}</div>
        </div>
        <div className="rounded-2xl bg-[#FBF9FF] p-4">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-[#8B7A98]">Handover</div>
          <div className="mt-1 text-sm font-black text-[#120724]">{fulfillmentLabel}</div>
        </div>
      </div>
    </div>
  );
}