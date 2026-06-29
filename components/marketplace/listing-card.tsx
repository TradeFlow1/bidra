import Image from "next/image";
import Link from "next/link";
import { Badge, cn } from "@/components/ui";

type ListingCardProps = {
  href: string;
  title: string;
  price?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  typeLabel?: "Buy Now" | "Offers" | string;
  highestOffer?: string | null;
  className?: string;
};

export function ListingCard({ href, title, price, location, imageUrl, typeLabel = "Offers", highestOffer, className }: ListingCardProps) {
  const badgeTone = typeLabel.toLowerCase().includes("buy") ? "buy" : "offer";
  return (
    <Link href={href} className={cn("group block overflow-hidden rounded-[24px] border border-[var(--bd-border)] bg-white shadow-[0_16px_44px_rgba(18,7,36,0.08)] transition hover:-translate-y-1 hover:border-[#cbb8e8] hover:shadow-[0_28px_85px_rgba(43,16,85,0.16)]", className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#F5F3FF,#FFFFFF)]">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-[1.04]" />
        ) : (
          <div className="grid h-full place-items-center text-sm font-black text-[#8b7a98]">No photo yet</div>
        )}
        <div className="absolute left-3 top-3"><Badge tone={badgeTone}>{typeLabel}</Badge></div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-black leading-tight tracking-[-0.035em] text-[var(--bd-ink)]">{title}</h3>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            {price ? <p className="text-xl font-black tracking-[-0.045em] text-[var(--bd-ink)]">{price}</p> : null}
            {highestOffer ? <p className="mt-1 text-xs font-bold text-[var(--bd-purple-dark)]">Highest offer {highestOffer}</p> : null}
            {location ? <p className="mt-1 text-xs font-semibold text-[var(--bd-muted)]">{location}</p> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
