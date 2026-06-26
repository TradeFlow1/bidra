import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "full" | "symbol";
  tone?: "dark" | "light";
};

export default function BrandLogo({ className, priority = false, variant = "full", tone = "dark" }: BrandLogoProps) {
  if (variant === "symbol") {
    return (
      <Image
        src="/brand/bidra-kids-bird-mark.svg"
        alt="Bidra"
        width={96}
        height={96}
        priority={priority}
        unoptimized
        className={className || "h-10 w-10 object-contain"}
      />
    );
  }

  const textClass = tone === "light" ? "text-white" : "text-[#120724]";
  const subTextClass = tone === "light" ? "text-[#DDD6FE]" : "text-[#7C3AED]";

  return (
    <span className={className || "inline-flex items-center gap-2.5"}>
      <Image
        src="/brand/bidra-kids-bird-mark.svg"
        alt="Bidra"
        width={48}
        height={48}
        priority={priority}
        unoptimized
        className="h-11 w-11 shrink-0 object-contain"
      />
      <span className="leading-none">
        <span className={"block text-[30px] font-black tracking-[-0.06em] " + textClass}>Bidra</span>
        <span className={"mt-1 block text-[9px] font-black uppercase tracking-[0.34em] " + subTextClass}>Bid. Buy. Sell.</span>
      </span>
    </span>
  );
}
