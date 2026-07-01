type OrderStatusValue = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";

function getStep(status: string): number {
  const s = String(status || "").toUpperCase();
  if (s === "PENDING") return 0;
  if (s === "ACCEPTED") return 1;
  if (s === "COMPLETED") return 2;
  return 0;
}

const STEPS: Array<{ key: OrderStatusValue; label: string }> = [
  { key: "PENDING", label: "Pending" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "COMPLETED", label: "Completed" }
];

export default function OrderStatusTimeline({ status }: { status: string }) {
  const active = getStep(status);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
      {STEPS.map(function (step, index) {
        const done = index <= active;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-black ${done ? "border-[#7C3AED] bg-[#7C3AED] text-white shadow-[0_10px_24px_rgba(124,58,237,0.24)]" : "border-[#E7DEF4] bg-[#F8FAFC] text-[#8B7A98]"}`}>
              {index + 1}
            </div>
            <span className={done ? "font-black text-[#120724]" : "font-semibold text-[#8B7A98]"}>{step.label}</span>
            {index < STEPS.length - 1 ? <div className={`hidden h-px w-6 sm:block ${done ? "bg-[#C4B5FD]" : "bg-[#E7DEF4]"}`} /> : null}
          </div>
        );
      })}
    </div>
  );
}