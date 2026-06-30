import type { ReactNode } from "react";

export function ListingActionPanel({
  canSplitActions,
  buyNowAction,
  offerAction,
  loginAction,
  ownerTools,
  watchlistAction,
}: {
  canSplitActions: boolean;
  buyNowAction?: ReactNode;
  offerAction?: ReactNode;
  loginAction?: ReactNode;
  ownerTools?: ReactNode;
  watchlistAction?: ReactNode;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-[32px] border border-[#E8E2F4] bg-[linear-gradient(180deg,#ffffff_0%,#fbf9ff_100%)] shadow-[0_20px_70px_rgba(18,7,36,0.08)]">
      <div className="border-b border-[#F0EAFE] bg-[radial-gradient(280px_140px_at_top_left,rgba(124,58,237,0.12),transparent_70%)] px-5 py-4 sm:px-6">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7C3AED]">Ready to transact</div>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#62516F]">Buy now, place an offer, or save this listing while you decide.</p>
      </div>

      <div className="grid gap-3 p-5 sm:p-6">
        <div className={canSplitActions ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
          <div className="rounded-[20px] border border-[#E8E2F4] bg-white/90 p-3 shadow-sm">{buyNowAction}</div>
          <div className="rounded-[20px] border border-[#E8E2F4] bg-white/90 p-3 shadow-sm">{offerAction}</div>
          <div className="rounded-[20px] border border-[#E8E2F4] bg-white/90 p-3 shadow-sm sm:col-span-2">{loginAction}</div>
        </div>

        {ownerTools ? (
          <div className="mt-1 rounded-[20px] border border-[#E8E2F4] bg-[#FBFAFF] p-3 shadow-sm">
            {ownerTools}
          </div>
        ) : (
          <div className="mt-1 rounded-[20px] border border-[#E8E2F4] bg-[#FBFAFF] p-3 shadow-sm">
            {watchlistAction}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-[#F0EAFE] bg-[#FBFAFF] px-5 py-4 text-center sm:px-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Secure</div>
          <div className="mt-1 text-xs font-black text-[#120724]">Messages</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Seller</div>
          <div className="mt-1 text-xs font-black text-[#120724]">Accepts</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Bidra</div>
          <div className="mt-1 text-xs font-black text-[#120724]">Records</div>
        </div>
      </div>
    </div>
  );
}
