import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BidraButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type BidraButtonSize = "sm" | "md" | "lg";

const variantClass: Record<BidraButtonVariant, string> = {
  primary: "border-transparent bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-sm hover:brightness-105",
  secondary: "border-[#D8E1F0] bg-white text-[#0F172A] shadow-sm hover:bg-[#F8FAFC]",
  danger: "border-red-200 bg-red-50 text-red-700 shadow-sm hover:bg-red-100",
  ghost: "border-transparent bg-transparent text-[#334155] hover:bg-[#EEF2FF]",
};

const sizeClass: Record<BidraButtonSize, string> = {
  sm: "h-9 rounded-[18px] px-3 text-xs",
  md: "h-11 rounded-[22px] px-5 text-sm",
  lg: "h-12 rounded-[24px] px-6 text-base",
};

type BaseProps = {
  children: ReactNode;
  variant?: BidraButtonVariant;
  size?: BidraButtonSize;
  fullWidth?: boolean;
  className?: string;
};

type BidraButtonAsButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
  href?: undefined;
};

type BidraButtonAsLinkProps = BaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
  href: string;
};

export type BidraButtonProps = BidraButtonAsButtonProps | BidraButtonAsLinkProps;

function buttonClasses(variant: BidraButtonVariant, size: BidraButtonSize, fullWidth?: boolean, className?: string) {
  return cn(
    "inline-flex items-center justify-center border font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60",
    variantClass[variant],
    sizeClass[size],
    fullWidth ? "w-full" : "",
    className,
  );
}

function isLinkProps(props: BidraButtonProps): props is BidraButtonAsLinkProps {
  return typeof props.href === "string" && props.href.length > 0;
}

export function BidraButton(props: BidraButtonProps) {
  const variant = props.variant || "primary";
  const size = props.size || "md";
  const classes = buttonClasses(variant, size, props.fullWidth, props.className);

  if (isLinkProps(props)) {
    const { href, variant: _variant, size: _size, fullWidth: _fullWidth, className: _className, children, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { href: _href, variant: _variant, size: _size, fullWidth: _fullWidth, className: _className, children, ...buttonProps } = props;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}