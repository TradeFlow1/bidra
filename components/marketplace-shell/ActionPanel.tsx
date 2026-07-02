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
    <aside>
      <p>Next step</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div>
        <Link href={primaryHref}>{primaryLabel}</Link>
        <Link href={secondaryHref}>{secondaryLabel}</Link>
      </div>
    </aside>
  );
}
