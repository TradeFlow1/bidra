import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "full" | "symbol" | "mono";
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ variant = "full", className }: BrandLogoProps) {
  const symbol = (
    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0B4DFF] text-lg font-black tracking-[-0.04em] text-white shadow-[0_12px_28px_rgba(11,77,255,0.24)]" aria-hidden="true">
      B
    </span>
  );

  if (variant === "symbol") {
    return <span className={cn("inline-flex items-center", className)}>{symbol}<span className="sr-only">Bidra</span></span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label="Bidra">
      {symbol}
      <span className={cn("text-2xl font-black tracking-[-0.06em]", variant === "mono" ? "text-white" : "text-[#07152E]")}>Bidra</span>
    </span>
  );
}
