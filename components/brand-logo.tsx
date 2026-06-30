import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "full" | "symbol";
  tone?: "dark" | "light";
};

export default function BrandLogo({ className, priority = false, variant = "full", tone = "dark" }: BrandLogoProps) {
  const textClass = tone === "light" ? "text-white" : "text-[#120724]";

  if (variant === "symbol") {
    return (
      <Image
        src="/brand/bidra-reference-mark.svg"
        alt="Bidra"
        width={96}
        height={96}
        priority={priority}
        unoptimized
        className={className || "h-10 w-10 object-contain"}
      />
    );
  }

  return (
    <span className={className || "inline-flex items-center gap-3"}>
      <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-[#160A2A] ring-1 ring-white/10">
        <Image
          src="/brand/bidra-reference-mark.svg"
          alt=""
          width={64}
          height={64}
          priority={priority}
          unoptimized
          className="h-12 w-12 object-contain"
        />
      </span>
      <span className="leading-none">
        <span className={"block text-[31px] font-black tracking-[-0.06em] " + textClass}>Bidra</span>
      </span>
    </span>
  );
}
