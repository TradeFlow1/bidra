import type { ReactNode } from "react";

export function StickyMobileActions({
  price,
  primaryAction,
  secondaryAction,
}: {
  price: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  if (!primaryAction && !secondaryAction) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#EDE9FE] bg-white/95 px-4 py-3 shadow-[0_-18px_50px_rgba(43,16,85,0.12)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-[720px] items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7C3AED]">Price</div>
          <div className="truncate text-lg font-black text-[#120724]">{price}</div>
        </div>
        <div className="grid min-w-[190px] grid-cols-1 gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      </div>
    </div>
  );
}