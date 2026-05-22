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
        src="/bidra-favicon.png?v=4"
        alt="Bidra"
        width={96}
        height={96}
        priority={priority}
        className={className || "h-9 w-9 object-contain"}
      />
    );
  }

  return (
    <span className={className || "relative block h-[78px] w-[390px] overflow-visible"}>
      <Image
        src="/bidra-logo.png?v=4"
        alt="Bidra"
        fill
        sizes="390px"
        priority={priority}
        className="object-contain object-left"
      />
    </span>
  );
}

