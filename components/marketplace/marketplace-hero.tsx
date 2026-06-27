import Link from "next/link";
import { anchorButtonClassName } from "@/components/ui";

export function MarketplaceHero() {
  return (
    <section className="overflow-hidden rounded-[32px] bg-[radial-gradient(780px_360px_at_76%_8%,rgba(124,58,237,0.34),transparent_68%),linear-gradient(135deg,#10061F_0%,#150A28_56%,#21103C_100%)] px-5 py-8 text-white shadow-[0_28px_90px_rgba(18,7,36,0.26)] sm:px-8 sm:py-10 lg:grid lg:grid-cols-[1fr_420px] lg:gap-8 lg:px-10 lg:py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/64">Australian marketplace</p>
        <h1 className="mt-4 text-5xl font-black leading-[0.94] tracking-[-0.065em] sm:text-6xl lg:text-7xl">Buy. Sell. Make offers.</h1>
        <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/72 sm:text-lg">Bidra is built for Australians who want a cleaner way to browse listings, make offers, buy now, message sellers and keep everything in one place.</p>
        <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
          <Link href="/listings" className={anchorButtonClassName("primary", "lg", "bg-white !text-[#5B21B6] hover:bg-[#F5F3FF] hover:!text-[#5B21B6]")}>Browse listings</Link>
          <Link href="/sell/new" className={anchorButtonClassName("secondary", "lg", "border-white/20 bg-white/10 !text-white hover:bg-white/16 hover:!text-white")}>Sell your item</Link>
        </div>
      </div>
      <div className="mt-8 rounded-[28px] border border-white/12 bg-white/10 p-4 shadow-[0_22px_70px_rgba(18,7,36,0.24)] backdrop-blur lg:mt-0">
        <div className="rounded-[24px] bg-white p-4 text-[#120724]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7C3AED]">Featured style</p>
          <div className="mt-4 rounded-[22px] bg-[linear-gradient(135deg,#F5F3FF,#FFFFFF)] p-4">
            <div className="aspect-[4/3] rounded-[20px] bg-[radial-gradient(circle_at_25%_20%,rgba(124,58,237,0.24),transparent_28%),linear-gradient(135deg,#FFFFFF,#F3EEFE)]"></div>
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-black tracking-[-0.04em]">Clean listing cards</p>
              <p className="mt-1 text-sm font-semibold text-[#6d647a]">Photos, price, location and highest offer.</p>
            </div>
            <span className="rounded-full bg-[#F3EEFE] px-3 py-1 text-xs font-black text-[#5B21B6]">Offers</span>
          </div>
        </div>
      </div>
    </section>
  );
}
