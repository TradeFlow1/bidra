import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bd-btn-primary border-transparent",
  secondary: "bd-btn-secondary border-transparent",
  outline: "bd-btn-outline",
  ghost: "bd-btn-ghost",
  destructive: "bd-btn-destructive border-transparent",
  link: "bd-btn-link border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function Button({ className, variant, size = "md", loading = false, disabled, children, ...props }: Props) {
  return (
    <button
      className={cn("bd-btn border", variant ? variantClasses[variant] : null, sizeClasses[size], className)}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
