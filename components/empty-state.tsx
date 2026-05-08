import Link from "next/link";

export default function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="bd-empty-state">
      <div className="bd-empty-icon" aria-hidden="true">•</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="bd-btn bd-btn-secondary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
