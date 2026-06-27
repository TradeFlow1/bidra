import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { anchorButtonClassName } from "./button";
import { cn } from "./cn";

export function LoadingSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[22px] border border-[var(--bd-border)] bg-white p-5 shadow-[0_14px_40px_rgba(18,7,36,0.06)]", className)}
      {...props}
    >
      <div className="h-5 w-1/3 rounded-full bg-slate-200" />
      <div className="mt-4 h-4 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-200" />
      <div className="mt-5 h-10 w-32 rounded-2xl bg-slate-200" />
    </div>
  );
}

export function PageState({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[28px] border border-[var(--bd-border)] bg-white px-5 py-10 text-center shadow-[0_18px_55px_rgba(18,7,36,0.08)] sm:px-8", className)}>
      {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--bd-purple)]">{eyebrow}</p> : null}
      <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-[-0.055em] text-[var(--bd-ink)] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--bd-muted)] sm:text-base">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={anchorButtonClassName("primary", "md", "mt-6")}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}

export function EmptyPageState(props: Omit<Parameters<typeof PageState>[0], "eyebrow">) {
  return <PageState eyebrow="Nothing here yet" {...props} />;
}

export function ErrorPageState(props: Omit<Parameters<typeof PageState>[0], "eyebrow">) {
  return <PageState eyebrow="Something needs attention" {...props} />;
}