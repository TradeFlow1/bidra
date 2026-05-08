import Link from "next/link";

export default function BackLink({
  href = "/listings",
  label = "Back",
  className = "",
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={["bd-back-link", className].filter(Boolean).join(" ")}>
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </Link>
  );
}
