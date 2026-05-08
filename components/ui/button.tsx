import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "bd-btn-primary",
  secondary: "bd-btn-secondary",
  outline: "bd-btn-outline",
  ghost: "bd-btn-ghost",
  destructive: "bd-btn-destructive",
};

export function Button({ className, variant = "secondary", loading = false, disabled, children, ...props }: Props) {
  return (
    <button
      className={cn("bd-btn", variantClass[variant], loading && "bd-btn-loading", className)}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
      {...props}
    >
      {loading ? <span aria-hidden="true">…</span> : null}
      {children}
    </button>
  );
}
