import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary: "border border-[var(--bd-purple)] bg-[linear-gradient(135deg,#8B5CF6_0%,#7C3AED_52%,#5B21B6_100%)] text-white shadow-[0_16px_34px_rgba(124,58,237,0.24)] hover:bg-[var(--bd-purple-dark)]",
  secondary: "border border-[var(--bd-border)] bg-white text-[var(--bd-ink)] shadow-[0_10px_28px_rgba(18,7,36,0.06)] hover:border-[#cbb8e8] hover:bg-[var(--bd-purple-soft)] hover:text-[var(--bd-purple-dark)]",
  ghost: "border border-transparent bg-transparent text-[var(--bd-ink)] hover:bg-[var(--bd-purple-soft)] hover:text-[var(--bd-purple-dark)]",
  danger: "border border-red-600 bg-red-600 text-white shadow-[0_14px_30px_rgba(239,68,68,0.22)] hover:bg-red-700",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-10 rounded-xl px-3 text-xs",
  md: "min-h-11 rounded-[14px] px-4 text-sm",
  lg: "min-h-12 rounded-2xl px-5 text-base",
};

export function buttonClassName(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn("inline-flex items-center justify-center gap-2 font-extrabold leading-none transition active:translate-y-px disabled:pointer-events-none disabled:opacity-60", variantClass[variant], sizeClass[size], className);
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClassName(variant, size, className)} {...props} />;
}

export function anchorButtonClassName(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return buttonClassName(variant, size, className);
}

export type AnchorButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; size?: ButtonSize };
