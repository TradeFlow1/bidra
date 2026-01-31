import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  "aria-label"?: string;
  prefetch?: boolean;
};

/**
 * Enforced clickable affordance:
 * - Always renders as a pill/boxed control (never naked text)
 * - Use for any in-app navigational link that must look clickable
 */
export function ClickableLink({
  href,
  children,
  className = "",
  title,
  prefetch,
  ...rest
}: Props) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      title={title}
      className={[
        "inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-semibold",
        "hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
        "transition-colors",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Link>
  );
}
