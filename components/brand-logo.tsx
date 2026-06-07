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
        className={className || "h-9 w-9 object-contain"}
      />
    );
  }

  return (
    <span className={className || "relative block h-10 w-36 overflow-hidden"} style={{ position: "relative", display: "block", height: "40px", width: "144px", overflow: "hidden" }}>
      <Image
        src="/bidra-logo.png"
        alt="Bidra"
        fill
        sizes="144px"
        priority={priority}
        className="object-contain object-left"
      />
    </span>
  );
}

