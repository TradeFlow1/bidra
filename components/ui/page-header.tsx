import type { ReactNode } from "react";
import { BackButton } from "./back-button";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, eyebrow, description, backHref, backLabel = "Back", actions, className }: PageHeaderProps) {
  return (
    <div className={cn("bd-page-header", className)}>
      {backHref ? <BackButton href={backHref} label={backLabel} /> : null}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="bd-eyebrow">{eyebrow}</p> : null}
          <h1 className="bd-page-title">{title}</h1>
          {description ? <div className="bd-page-description">{description}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
