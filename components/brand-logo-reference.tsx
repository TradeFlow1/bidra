import Image from "next/image";

type Props = { className?: string; priority?: boolean; tone?: "dark" | "light" };

export default function BrandLogoReference({ className, priority = false, tone = "light" }: Props) {
  const textClass = tone === "light" ? "text-white" : "text-[#120724]";

  return (
    <span className={className || "inline-flex items-center gap-3"}>
      <Image src="/brand/bidra-mark-clean.svg" alt="Bidra" width={58} height={58} priority={priority} className="h-11 w-11 shrink-0 object-contain" />
      <span className={"text-[34px] font-black leading-none tracking-[-0.065em] " + textClass}>Bidra</span>
    </span>
  );
}
