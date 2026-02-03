type Props = {
  status: string;
  outcome?: string | null;
  className?: string;
};

function stepIndex(status: string, outcome?: string | null) {
  const s = String(status || "").toUpperCase();
  const o = String(outcome || "").toUpperCase();

  if (o === "COMPLETED" || s === "COMPLETED") return 2;
  if (s === "PAID") return 1;
  return 0; // PENDING / default
}

export default function OrderStatusTimeline({ status, outcome, className = "" }: Props) {
  const idx = stepIndex(status, outcome);

  const steps = [
    { key: "PLACED", label: "Placed" },
    { key: "PAID", label: "Paid" },
    { key: "COMPLETED", label: "Completed" },
  ];

  return (
    <div className={("bd-card p-4 " + className).trim()}>
      <div className="text-sm font-extrabold bd-ink">Order status</div>

      <div className="mt-3 flex items-center gap-2">
        {steps.map((s, i) => {
          const done = i < idx;
          const active = i === idx;

          return (
            <div key={s.key} className="flex items-center min-w-0">
              <div
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-extrabold " +
                  (done ? "bg-black text-white border-black" : active ? "bg-white text-black border-black" : "bg-white text-black/40 border-black/15")
                }
                aria-label={s.label}
                title={s.label}
              >
                {i + 1}
              </div>

              <div className={"ml-2 text-sm font-extrabold " + (done || active ? "bd-ink" : "text-black/40")}>
                {s.label}
              </div>

              {i < steps.length - 1 ? (
                <div className={"mx-3 h-[2px] w-10 rounded " + (i < idx ? "bg-black" : "bg-black/10")} />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-xs bd-ink2">
        Bidra records confirmations and status updates, but does not process payments.
      </div>
    </div>
  );
}
