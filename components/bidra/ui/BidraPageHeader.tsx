import type { ReactNode } from "react";

export function BidraPageHeader({ eyebrow, title, description, actions }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="rounded-[30px] border border-[#EDE9FE] bg-[linear-gradient(135deg,#FFFFFF_0%,#FBF9FF_58%,#F5F3FF_100%)] p-5 shadow-[0_22px_64px_rgba(43,16,85,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7C3AED]">{eyebrow}</div> : null}
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#120724] sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 text-sm font-semibold leading-7 text-[#62516F] sm:text-base">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      </div>
    </header>
  );
}
