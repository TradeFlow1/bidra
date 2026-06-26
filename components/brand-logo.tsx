import Image from "next/image";
type BrandLogoProps = { className?: string; priority?: boolean; variant?: "full" | "symbol"; tone?: "dark" | "light"; };
export default function BrandLogo({ className, priority = false, variant = "full", tone = "dark" }: BrandLogoProps) {
  if (variant === "symbol") {
    return <Image src="/brand/bidra-child-drawing-mark.svg" alt="Bidra" width={96} height={96} priority={priority} unoptimized className={className || "h-9 w-9 object-contain"} />;
  }
  const textClass = tone === "light" ? "text-white" : "text-[#120724]";
  return (
    <span className={className || "inline-flex items-center gap-3"}>
      <Image src="/brand/bidra-child-drawing-mark.svg" alt="" width={52} height={52} priority={priority} unoptimized className="h-10 w-10 shrink-0 object-contain" />
      <span className="leading-none">
        <span className={"block text-[28px] font-black tracking-[-0.055em] " + textClass}>Bidra</span>
      </span>
    </span>
  );
}
