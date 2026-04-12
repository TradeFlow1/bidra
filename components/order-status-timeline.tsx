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
    <div className="flex items-center gap-2 text-xs">
      {STEPS.map(function (step, index) {
        const done = index <= active;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className={done ? "h-2.5 w-2.5 rounded-full bg-black" : "h-2.5 w-2.5 rounded-full bg-neutral-300"} />
            <span className={done ? "font-medium text-black" : "text-neutral-500"}>{step.label}</span>
            {index < STEPS.length - 1 ? <div className="h-px w-6 bg-neutral-300" /> : null}
          </div>
        );
      })}
    </div>
  );
}