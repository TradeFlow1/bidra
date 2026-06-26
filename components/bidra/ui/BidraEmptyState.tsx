import type { ReactNode } from "react";
import { BidraCard } from "./BidraCard";

export function BidraEmptyState({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <BidraCard className="border-dashed p-8 text-center">
      <div className="mx-auto mb-5 h-1 w-14 rounded-full bg-[#7C3AED]" />
      <h2 className="text-xl font-black tracking-[-0.035em] text-[#120724]">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-7 text-[#62516F]">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </BidraCard>
  );
}
