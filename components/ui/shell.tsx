import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function PageShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10", className)} {...props} />;
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-6 sm:py-8 lg:py-10", className)} {...props} />;
}

export function PageHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--bd-purple)]">{eyebrow}</p> : null}
      <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[var(--bd-ink)] sm:text-5xl lg:text-6xl">{title}</h1>
      {description ? <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[var(--bd-muted)]">{description}</p> : null}
    </div>
  );
}
