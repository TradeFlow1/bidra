import type { ReactNode } from "react";
import { BidraCard } from "./BidraCard";

export function BidraSection({ title, description, children }: { title?: ReactNode; description?: ReactNode; children: ReactNode }) {
  return (
    <BidraCard className="p-5 sm:p-6">
      {title ? <h2 className="text-xl font-extrabold tracking-tight text-[#0F172A]">{title}</h2> : null}
      {description ? <p className="mt-2 text-sm leading-7 text-[#475569]">{description}</p> : null}
      <div className={title || description ? "mt-4" : ""}>{children}</div>
    </BidraCard>
  );
}