import type { ReactNode } from "react";
import { BidraCard } from "./BidraCard";

export function BidraEmptyState({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <BidraCard className="p-6 text-center">
      <h2 className="text-xl font-extrabold tracking-tight text-[#0F172A]">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[#475569]">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </BidraCard>
  );
}