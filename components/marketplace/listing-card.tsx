import Image from "next/image";
import Link from "next/link";
import { Badge, cn } from "@/components/ui";

type ListingCardProps = {
  href: string;
  title: string;
  price?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  typeLabel?: "Buy Now" | "Offers" | "Offer" | string;
  highestOffer?: string | null;
  className?: string;
};

function HeartIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

export function ListingCard({ href, title, price, location, imageUrl, typeLabel = "Offer", highestOffer, className }: ListingCardProps) {
  const label = typeLabel.toLowerCase().includes("buy") ? "Buy Now" : typeLabel.toLowerCase().includes("offer") ? "Offer" : typeLabel;
  const badgeTone = label.toLowerCase().includes("buy") ? "buy" : "offer";

  return (
    <Link href={href} className={cn("group block overflow-hidden rounded-[24px] border border-[#E8E2F4] bg-[linear-gradient(180deg,#ffffff_0%,#fcf9ff_100%)] shadow-[0_16px_48px_rgba(18,7,36,0.09)] transition hover:-translate-y-1 hover:border-[#C4B5FD] hover:shadow-[0_30px_90px_rgba(43,16,85,0.16)]", className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#F5F3FF,#FFFFFF)]">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transition duration-500 group-hover:scale-[1.045]" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(124,58,237,0.23),transparent_30%),linear-gradient(135deg,#FFFFFF,#F3EEFE)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-black/10" />
        <div className="absolute left-3 top-3"><Badge tone={badgeTone}>{label}</Badge></div>
        <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/90 text-[#4C3D63] shadow-[0_10px_24px_rgba(18,7,36,0.13)] backdrop-blur transition group-hover:text-[#7C3AED]"><HeartIcon /></div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="rounded-[16px] border border-[#F0EAFE] bg-[#FBF9FF] p-3 shadow-sm">
          <h3 className="line-clamp-2 min-h-[2.35rem] text-sm font-black leading-tight tracking-[-0.03em] text-[#120724]">{title}</h3>
          <div className="mt-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8B7A98]">Current offer</p>
            {price ? <p className="mt-1 text-xl font-black tracking-[-0.045em] text-[#120724]">{price}</p> : <p className="mt-1 text-xl font-black tracking-[-0.045em] text-[#120724]">Price hidden</p>}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-bold text-[#6D647A]">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">{location ? <PinIcon /> : null}<span className="truncate">{location || "Australia"}</span></span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[#E11D48]"><ClockIcon /> {highestOffer ? "Active" : "Live"}</span>
        </div>
      </div>
    </Link>
  );
}
