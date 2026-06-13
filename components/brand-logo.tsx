import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "full" | "symbol";
};

export default function BrandLogo({ className, priority = false, variant = "full" }: BrandLogoProps) {
  if (variant === "symbol") {
    return (
      <Image
        src="/bidra-favicon.png"
        alt="Bidra"
        width={96}
        height={96}
        priority={priority}
        unoptimized
        className={className || "h-9 w-9 object-contain"}
      />
    );
  }

  return (
    <span className={className || "relative block h-14 w-44 overflow-hidden"} style={{ position: "relative", display: "block", height: "56px", width: "176px", overflow: "hidden" }}>
      <Image
        src="/bidra-logo.png"
        alt="Bidra"
        fill
        sizes="176px"
        priority={priority}
        unoptimized
        className="scale-[1.55] object-contain object-left origin-left"
      />
    </span>
  );
}