import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "./cn";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-extrabold text-[var(--bd-ink)]", className)} {...props} />;
}

export function HelpText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1.5 text-xs leading-5 text-[var(--bd-muted)]", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-11 w-full rounded-[14px] border border-[var(--bd-border)] bg-white px-3.5 py-2.5 text-[var(--bd-ink)] shadow-[0_8px_22px_rgba(18,7,36,0.04)] outline-none transition placeholder:text-[#8b7a98] focus:border-[var(--bd-purple)] focus:ring-4 focus:ring-purple-200/60", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-32 w-full rounded-[14px] border border-[var(--bd-border)] bg-white px-3.5 py-2.5 text-[var(--bd-ink)] shadow-[0_8px_22px_rgba(18,7,36,0.04)] outline-none transition placeholder:text-[#8b7a98] focus:border-[var(--bd-purple)] focus:ring-4 focus:ring-purple-200/60", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("min-h-11 w-full rounded-[14px] border border-[var(--bd-border)] bg-white px-3.5 py-2.5 text-[var(--bd-ink)] shadow-[0_8px_22px_rgba(18,7,36,0.04)] outline-none transition focus:border-[var(--bd-purple)] focus:ring-4 focus:ring-purple-200/60", className)} {...props} />;
}
