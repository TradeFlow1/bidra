type TimedOfferWindowPanelProps = {
  isOfferable: boolean;
  isOwner: boolean;
  currentOfferAmount?: number | null;
  offerCount?: number;
  nextOfferExpiry?: Date | string | null;
};

function money(cents: number | null | undefined) {
  if (typeof cents !== "number" || !Number.isFinite(cents)) return "-";
  return "$" + (cents / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function formatExpiry(value: Date | string | null | undefined) {
  if (!value) return "No active offer window yet";
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "No active offer window yet";
  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function closingLabel(value: Date | string | null | undefined) {
  if (!value) return "Waiting for first offer";
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "Waiting for first offer";

  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "Offer window ended";
  if (diff <= 60 * 60 * 1000) return "Closing within 1 hour";
  if (diff <= 24 * 60 * 60 * 1000) return "Closing today";
  if (diff <= 3 * 24 * 60 * 60 * 1000) return "Closing soon";
  return "Timed offers open";
}

export default function TimedOfferWindowPanel({
  isOfferable,
  isOwner,
  currentOfferAmount,
  offerCount = 0,
  nextOfferExpiry,
}: TimedOfferWindowPanelProps) {
  if (!isOfferable) return null;

  const hasOffers = offerCount > 0;

  return (
    <div className="mt-6 rounded-2xl border border-[#C7D2FE] bg-[#F8FAFF] p-5 shadow-sm" id="timed-offer-window">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F46E5]">Timed offers</div>
          <h2 className="mt-2 text-lg font-black text-[#080D32]">{closingLabel(nextOfferExpiry)}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#42526F]">
            Buyers can make offers while the offer window is open. The seller chooses whether to accept an offer and arranges payment, pickup, delivery or postage directly in Bidra Messages.
          </p>
        </div>
        <div className="grid min-w-[170px] gap-2 rounded-2xl border border-[#D8E1F0] bg-white p-4 text-sm shadow-sm">
          <div className="flex justify-between gap-4">
            <span className="font-bold text-[#64748B]">Visible offer</span>
            <span className="font-black text-[#080D32]">{money(currentOfferAmount)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-bold text-[#64748B]">Offers</span>
            <span className="font-black text-[#080D32]">{offerCount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-bold text-[#64748B]">Window</span>
            <span className="font-black text-[#080D32]">{formatExpiry(nextOfferExpiry)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-[#42526F] sm:grid-cols-2">
        <div className="rounded-2xl border border-[#D8E1F0] bg-white p-4">
          {isOwner
            ? "When the offer window closes, review the offers and choose whether to accept one. Bidra does not automatically sell the item."
            : hasOffers
              ? "A visible offer is present. You can still make your own offer while the window is open."
              : "Be the first to make an offer. The seller decides whether to accept any offer."}
        </div>
        <div className="rounded-2xl border border-[#D8E1F0] bg-white p-4">
          Keep pickup, postage, payment and handover details in Bidra Messages. Bidra provides the listing, offer and messaging tools only.
        </div>
      </div>
    </div>
  );
}
