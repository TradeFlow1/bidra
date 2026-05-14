import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "full" | "symbol" | "mono";
  className?: string;
  priority?: boolean;
};

const logoSrc = {
  full: "/brand/bidra-logo.svg",
  symbol: "/brand/bidra-symbol.svg",
  mono: "/brand/bidra-logo-mono.svg",
};

const dimensions = {
  full: { width: 520, height: 148 },
  symbol: { width: 148, height: 148 },
  mono: { width: 520, height: 148 },
};

export default function BrandLogo({ variant = "full", className, priority = false }: BrandLogoProps) {
  const size = dimensions[variant];
  return (
    <Image
      src={logoSrc[variant]}
      alt="Bidra"
      width={size.width}
      height={size.height}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
      sizes={variant === "symbol" ? "44px" : "160px"}
    />
  );
}
