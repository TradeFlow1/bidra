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
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
