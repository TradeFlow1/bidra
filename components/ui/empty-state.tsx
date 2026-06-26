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
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#EDE9FE] bg-[#FBF9FF] text-sm font-black text-[#6D28D9] shadow-sm" aria-hidden="true">
        B
      </div>
      <h2 className="mt-4 text-xl font-extrabold tracking-tight text-[#120724]">{title}</h2>
      <div className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#62516F]">{description}</div>
      {action || secondaryAction ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
