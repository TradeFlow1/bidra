import Image from "next/image";
type BrandLogoProps = { className?: string; priority?: boolean; variant?: "full" | "symbol"; tone?: "dark" | "light" | "default"; };
export default function BrandLogo({ className, priority = false, variant = "full", tone = "dark" }: BrandLogoProps) {
  if (variant === "symbol") {
    return <Image src="/brand/bidra-child-drawing-mark.svg" alt="Bidra" width={96} height={96} priority={priority} unoptimized className={className || "h-9 w-9 object-contain"} />;
  }
  const textClass = tone === "light" ? "text-white" : "text-[#17131F]";
  return (
    <span className={className || "inline-flex items-center gap-3"}>
      <Image src="/brand/bidra-child-drawing-mark.svg" alt="" width={48} height={48} priority={priority} unoptimized className="h-9 w-9 shrink-0 object-contain" />
      <span className="leading-none">
        <span className={"block text-[24px] font-black tracking-[-0.04em] " + textClass}>Bidra</span>
      </span>
    </span>
  );
}
