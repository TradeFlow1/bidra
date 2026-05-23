import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, secondaryAction, className }: EmptyStateProps) {
  return (
    <div className={cn("bd-empty-state", className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white text-xl shadow-sm hover:bg-[#F5F3FF]" aria-hidden="true">⌕</div>
      <h2 className="mt-4 text-xl font-extrabold tracking-tight text-[#0F172A]">{title}</h2>
      <div className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#475569]">{description}</div>
      {(action || secondaryAction) ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
