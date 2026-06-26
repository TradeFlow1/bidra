$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
if (!(Test-Path -LiteralPath ".\package.json") -or !(Test-Path -LiteralPath ".\.git")) { throw "Refusing to run: not repo root." }

$Path = ".\components\marketplace-redesign.tsx"
$FileLines = @(
'import Image from "next/image";'
'import Link from "next/link";'
'import type React from "react";'
'import { ProductPlaceholder, MarketplaceIcon } from "@/components/marketplace-ui";'
'import { cn } from "@/lib/utils";'
'export const appShell = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10";'
'export const appNarrowShell = "mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8";'
'export function ReferencePage({ children, className }: { children: React.ReactNode; className?: string }) { return <main className={cn("bg-[#FBF9FF] pb-10 text-[#120724]", className)}>{children}</main>; }'
'function money(cents: number | null | undefined) { const value = typeof cents === "number" ? cents : 0; return (value / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }); }'
'function TrustItem({ icon, title, body }: { icon: string; title: string; body: string }) { return <div className="rounded-[22px] border border-[#EDE9FE] bg-white/80 p-4 shadow-[0_14px_40px_rgba(43,16,85,0.06)]"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F5F3FF] text-[#6D28D9]"><MarketplaceIcon name={icon as any} className="h-5 w-5" /></span><div className="mt-3 text-sm font-black text-[#120724]">{title}</div><p className="mt-1 text-xs font-semibold leading-5 text-[#62516F]">{body}</p></div>; }'
'type FeaturedHeroListing = { id: string; title: string; category: string; price: number; imageUrl?: string | null; };'
'export function HomeHero({ sellHref, featuredListings = [] }: { sellHref: string; featuredListings?: FeaturedHeroListing[] }) {'
'  return <section className="relative overflow-hidden rounded-[34px] border border-[#DDD6FE] bg-white shadow-[0_28px_90px_rgba(43,16,85,0.12)]">'
'    <div className="absolute inset-0 bg-[linear-gradient(135deg,#FFFFFF_0%,#FBF9FF_42%,#F5F3FF_100%)]" />'
'    <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_520px] lg:p-10 xl:p-12">'
'      <div className="flex min-h-[500px] flex-col justify-center">'
'        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#DDD6FE] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#6D28D9] shadow-sm">Premium Australian marketplace</div>'
'        <h1 className="mt-6 max-w-3xl text-[44px] font-black leading-[0.92] tracking-[-0.065em] text-[#120724] sm:text-6xl lg:text-7xl">Buy and sell with confidence.</h1>'
'        <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-[#62516F] sm:text-lg">Bidra brings serious listings, clear offers and secure messaging into one clean marketplace built for Australia.</p>'
'        <div className="mt-7 rounded-[24px] border border-[#DDD6FE] bg-white p-3 shadow-[0_18px_50px_rgba(43,16,85,0.08)]">'
'          <form action="/listings" className="grid gap-3 md:grid-cols-[1fr_auto]">'
'            <input name="q" placeholder="Search cars, tools, furniture, electronics..." className="h-14 rounded-2xl border border-[#EDE9FE] bg-[#FBF9FF] px-5 text-base font-bold text-[#120724] outline-none placeholder:text-[#8B7A98] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE]" />'
'            <button className="bd-btn bd-btn-primary h-14 rounded-2xl px-7" type="submit">Search Bidra</button>'
'          </form>'
'        </div>'
'        <div className="mt-5 flex flex-col gap-3 sm:flex-row">'
'          <Link href="/listings" className="bd-btn bd-btn-primary h-12 rounded-2xl px-6">Browse listings</Link>'
'          <Link href={sellHref} className="bd-btn bd-btn-secondary h-12 rounded-2xl px-6">Sell your item</Link>'
'        </div>'
'        <div className="mt-8 grid gap-3 sm:grid-cols-3">'
'          <TrustItem icon="safe" title="Trust focused" body="Clear records, reports and safer marketplace behaviour." />'
'          <TrustItem icon="offer" title="Offers or buy now" body="Flexible ways to transact without messy auction noise." />'
'          <TrustItem icon="location" title="Australia wide" body="Local handover, pickup and postage friendly." />'
'        </div>'
'      </div>'
'      <ProductCollage listings={featuredListings} />'
'    </div>'
'  </section>;'
'}'
'export function ProductCollage({ listings = [] }: { listings?: FeaturedHeroListing[] }) {'
'  const fallbackProducts: FeaturedHeroListing[] = [{ id: "fallback-tools", title: "Tradie tools", category: "Tools", price: 650 }, { id: "fallback-bike", title: "Weekend bike", category: "Sports", price: 420 }, { id: "fallback-camera", title: "Camera kit", category: "Electronics", price: 880 }, { id: "fallback-sofa", title: "Designer sofa", category: "Home", price: 1200 }];'
'  const items = [...listings, ...fallbackProducts].slice(0, 4);'
'  const kinds = ["tools", "bicycle", "camera", "sofa"];'
'  return <div className="hidden min-h-[500px] grid-cols-2 gap-4 lg:grid">'
'    {items.map((item, index) => <Link key={item.id} href={item.id.startsWith("fallback-") ? "/listings" : "/listings/" + item.id} className={cn("group relative overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_22px_65px_rgba(43,16,85,0.16)] transition hover:-translate-y-1 hover:shadow-[0_28px_85px_rgba(43,16,85,0.20)]", index === 0 ? "mt-8" : "", index === 3 ? "-mt-8" : "")}>'
'      <div className="relative h-full min-h-[230px]">'
'        {item.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill sizes="320px" className="object-cover transition duration-300 group-hover:scale-[1.04]" /> : <ProductPlaceholder kind={(kinds[index] || "empty") as any} className="h-full min-h-[230px]" />}'
'      </div>'
'      <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/60 bg-white/92 p-3 shadow-lg backdrop-blur">'
'        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6D28D9]">{item.category}</div>'
'        <div className="mt-1 truncate text-sm font-black text-[#120724]">{item.title}</div>'
'        <div className="mt-1 text-sm font-black text-[#2B1055]">{money(item.price)}</div>'
'      </div>'
'    </Link>)}'
'  </div>;'
'}'
'export function HomeTrustStrip() { const items = [["safe", "Safety first", "Reports, moderation and message records"], ["offer", "Flexible deals", "Buy now or make an offer"], ["location", "Local friendly", "Pickup, postage and handover ready"], ["profile", "Seller clarity", "Profile and listing context up front"]] as const; return <section className="my-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.map(([icon,title,body]) => <TrustItem key={title} icon={icon} title={title} body={body} />)}</section>; }'
'export function TrustStrip() { return <HomeTrustStrip />; }'
'export function MarketplaceSection({ eyebrow, title, action, children, className }: { eyebrow?: string; title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) { return <section className={cn("py-5 sm:py-8", className)}><div className="mb-5 flex items-end justify-between gap-4"><div>{eyebrow ? <div className="text-[11px] font-black uppercase tracking-[0.20em] text-[#7C3AED]">{eyebrow}</div> : null}<h2 className="mt-1 text-2xl font-black tracking-[-0.045em] text-[#120724] sm:text-3xl">{title}</h2></div>{action}</div>{children}</section>; }'
'export function CategoryPillGrid({ categories }: { categories: Array<{ label: string; href: string; icon?: string; meta?: string }> }) { return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{categories.map((category) => <Link key={category.href + category.label} href={category.href} className="group rounded-[24px] border border-[#EDE9FE] bg-white p-4 shadow-[0_14px_40px_rgba(43,16,85,0.06)] transition hover:-translate-y-1 hover:border-[#C4B5FD] hover:shadow-[0_24px_70px_rgba(43,16,85,0.12)]"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F5F3FF] text-[#6D28D9]"><MarketplaceIcon name={(category.icon || "grid") as any} className="h-5 w-5" /></span><div className="mt-4 text-sm font-black text-[#120724]">{category.label}</div><div className="mt-1 text-xs font-bold text-[#62516F]">{category.meta || "Explore"}</div></Link>)}</div>; }'
'export function EmptyMarketplaceState({ title, body, href, cta }: { title: string; body: string; href?: string; cta?: string }) { return <div className="col-span-full rounded-[28px] border border-dashed border-[#C4B5FD] bg-white p-8 text-center shadow-[0_18px_50px_rgba(43,16,85,0.07)]"><h3 className="text-xl font-black text-[#120724]">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-[#62516F]">{body}</p>{href && cta ? <Link href={href} className="bd-btn bd-btn-primary mt-5 rounded-2xl px-6">{cta}</Link> : null}</div>; }'
)
Set-Content -LiteralPath $Path -Value $FileLines -Encoding UTF8
if (Test-Path -LiteralPath ".\.next") { Remove-Item -LiteralPath ".\.next" -Recurse -Force }
npm.cmd run build
git add components/marketplace-redesign.tsx
git commit -m "Redesign homepage marketplace system"
git push origin premium-purple-visual-overhaul
Write-Host "Premium homepage system committed and pushed."
