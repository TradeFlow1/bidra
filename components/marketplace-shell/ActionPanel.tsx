import Link from "next/link";

type ActionPanelProps = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export default function ActionPanel({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: ActionPanelProps) {
  return (
    <aside className="mk-panel mk-action-panel">
      <p className="mk-kicker">Action panel</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="mk-action-meta" aria-label="Action panel highlights">
        <span>Fast setup</span>
        <span>Mobile ready</span>
        <span>Offer flow</span>
      </div>
      <div className="mk-action-row">
        <Link href={primaryHref} className="mk-btn mk-btn-primary">{primaryLabel}</Link>
        <Link href={secondaryHref} className="mk-btn mk-btn-ghost">{secondaryLabel}</Link>
      </div>
    </aside>
  );
}
