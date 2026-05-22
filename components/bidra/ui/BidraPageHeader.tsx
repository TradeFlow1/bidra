import type { ReactNode } from "react";

export function BidraPageHeader({ eyebrow, title, description, actions }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="rounded-[30px] border border-[#D8E1F0] bg-gradient-to-br from-white to-[#F8FAFC] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0E7490]">{eyebrow}</div> : null}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-7 text-[#475569] sm:text-base">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      </div>
    </header>
  );
}