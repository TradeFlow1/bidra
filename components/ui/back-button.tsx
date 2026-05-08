import Link from "next/link";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function BackButton({ href = "/listings", label = "Back", className }: BackButtonProps) {
  return (
    <Link href={href} className={cn("bd-back-link", className)}>
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </Link>
  );
}
