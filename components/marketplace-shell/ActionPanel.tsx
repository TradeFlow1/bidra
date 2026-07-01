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
      <p className="mk-kicker">Next step</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="mk-action-row">
        <Link href={primaryHref} className="mk-btn mk-btn-primary">{primaryLabel}</Link>
        <Link href={secondaryHref} className="mk-btn mk-btn-ghost">{secondaryLabel}</Link>
      </div>
    </aside>
  );
}
