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
    <div className="mt-6 overflow-hidden rounded-[32px] border border-[#E8E2F4] bg-white shadow-[0_20px_70px_rgba(18,7,36,0.08)]">
      <div className="bg-[linear-gradient(135deg,#120724,#231044)] px-5 py-5 text-white sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/12 text-xl font-black text-white shadow-sm">
            {sellerAvatarUrl ? (
              <Image src={sellerAvatarUrl} alt={sellerName} width={64} height={64} className="h-full w-full object-cover" unoptimized />
            ) : (
              sellerInitials
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-black tracking-[-0.03em]">{sellerName}</div>
            <div className="mt-1 truncate text-xs font-semibold text-white/68">{sellerLocation}</div>
            <div className="mt-1 text-xs font-semibold text-white/56">Member since {sellerJoined}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {sellerBadges.length ? (
            sellerBadges.map((badge) => (
              <span key={badge} className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-100">
                {badge}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-black text-white/76">
              Verification pending
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        <Link href={sellerHref} className="flex h-12 items-center justify-center rounded-[16px] border border-[#DDD6FE] bg-white px-5 text-sm font-black text-[#5B21B6] shadow-sm transition hover:bg-[#F5F3FF]">
          View profile
        </Link>
        {messageAction}
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-[#F0EAFE] p-5 sm:p-6">
        <div className="rounded-[16px] bg-[#FBFAFF] px-3 py-3 text-center ring-1 ring-[#E8E2F4]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Feedback</div>
          <div className="mt-1 text-xl font-black text-[#120724]">{sellerFeedbackCount}</div>
        </div>
        <div className="rounded-[16px] bg-[#FBFAFF] px-3 py-3 text-center ring-1 ring-[#E8E2F4]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Listings</div>
          <div className="mt-1 text-xl font-black text-[#120724]">{sellerListingCount}</div>
        </div>
        <div className="rounded-[16px] bg-[#FBFAFF] px-3 py-3 text-center ring-1 ring-[#E8E2F4]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Handover</div>
          <div className="mt-1 truncate text-xs font-black text-[#120724]">{fulfillmentLabel}</div>
        </div>
      </div>
    </div>
  );
}
