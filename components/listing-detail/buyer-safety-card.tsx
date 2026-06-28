export function BuyerSafetyCard() {
  return (
    <div className="mt-6 rounded-[24px] border border-[#DDD6FE] bg-white p-5 shadow-[0_14px_40px_rgba(43,16,85,0.06)]">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7C3AED]">Buyer safety</div>
      <h2 className="mt-2 text-lg font-black text-[#120724]">Keep the handover clear.</h2>
      <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[#62516F]">
        <li>Use Bidra Messages to keep a record before pickup, delivery or postage.</li>
        <li>Inspect the item and confirm condition before paying where practical.</li>
        <li>Use public handover locations when possible and report unusual requests.</li>
      </ul>
    </div>
  );
}