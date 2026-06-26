$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
if (!(Test-Path -LiteralPath ".\package.json") -or !(Test-Path -LiteralPath ".\.git")) { throw "Refusing to run: not repo root." }

$brandLogo = @'
import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "full" | "symbol";
  tone?: "dark" | "light";
};

export default function BrandLogo({ className, priority = false, variant = "full", tone = "dark" }: BrandLogoProps) {
  const textClass = tone === "light" ? "text-white" : "text-[#120724]";
  const subTextClass = tone === "light" ? "text-[#DDD6FE]" : "text-[#7C3AED]";

  if (variant === "symbol") {
    return <Image src="/brand/bidra-kids-bird-mark.svg" alt="Bidra" width={96} height={96} priority={priority} unoptimized className={className || "h-10 w-10 object-contain"} />;
  }

  return (
    <span className={className || "inline-flex items-center gap-2.5"}>
      <Image src="/brand/bidra-kids-bird-mark.svg" alt="" width={52} height={52} priority={priority} unoptimized className="h-12 w-12 shrink-0 object-contain" />
      <span className="leading-none">
        <span className={"block text-[32px] font-black tracking-[-0.06em] " + textClass}>Bidra</span>
        <span className={"mt-1 block text-[9px] font-black uppercase tracking-[0.34em] " + subTextClass}>Bid. Buy. Sell.</span>
      </span>
    </span>
  );
}
'@
Set-Content -LiteralPath ".\components\brand-logo.tsx" -Value $brandLogo -Encoding UTF8

$cssPath = ".\styles\premium-purple.css"
$css = @'
:root{--brand:#7C3AED;--brand-hover:#6D28D9;--brand-accent:#A855F7;--brand-soft:#F5F3FF;--brand-soft-2:#EDE9FE;--brand-border:#DDD6FE;--text-main:#120724;--text-muted:#62516F;--surface:#FFFFFF}
html{background:#FBF9FF}
body{background:radial-gradient(1000px 460px at 10% -180px,rgba(168,85,247,.20),transparent 70%),radial-gradient(900px 420px at 95% -180px,rgba(124,58,237,.16),transparent 72%),linear-gradient(180deg,#FBF9FF 0%,#F7F2FF 42%,#FFFFFF 100%)!important;color:#120724!important}
.bd-premium-header{border-bottom:1px solid rgba(221,214,254,.70)!important;background:radial-gradient(900px 320px at 18% 0%,rgba(168,85,247,.28),transparent 70%),linear-gradient(135deg,rgba(18,7,36,.98) 0%,rgba(43,16,85,.96) 54%,rgba(91,33,182,.94) 100%)!important;color:#fff!important;box-shadow:0 16px 45px rgba(18,7,36,.18);backdrop-filter:blur(18px)}
.bd-premium-search{border-color:rgba(255,255,255,.14)!important;background:rgba(255,255,255,.10)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 12px 28px rgba(18,7,36,.20)!important}
.bd-premium-search::placeholder{color:rgba(255,255,255,.58)!important}
.bd-premium-footer{background:radial-gradient(700px 280px at 80% 0%,rgba(168,85,247,.20),transparent 70%),linear-gradient(135deg,#120724 0%,#1B0B33 52%,#2B1055 100%)!important;color:#fff!important}
.bd-btn-primary,.bd-primary-action,.bd-hero-primary-button{border-color:#7C3AED!important;background:linear-gradient(135deg,#A855F7 0%,#7C3AED 48%,#5B21B6 100%)!important;color:#fff!important;box-shadow:0 16px 34px rgba(124,58,237,.30)!important}
.bd-btn-secondary{border-color:rgba(124,58,237,.18)!important;background:#fff!important;color:#2B1055!important;box-shadow:0 12px 28px rgba(43,16,85,.08)!important}
.bd-card,.bd-form-card,.bd-empty-state,.bd-marketplace-section,.bd-surface,.bd-marketplace-card,.bd-listing-gallery-card,.bd-listing-under-gallery,.bd-page-hero{border-color:rgba(124,58,237,.16)!important;background:rgba(255,255,255,.96)!important;box-shadow:0 18px 50px rgba(43,16,85,.08)!important}
.bd-marketplace-card:hover,.bd-card-clickable:hover{border-color:rgba(124,58,237,.30)!important;box-shadow:0 24px 70px rgba(43,16,85,.13)!important;transform:translateY(-2px)}
input:not([type=checkbox]):not([type=radio]),select,textarea,.bd-input{border-color:rgba(124,58,237,.18)!important;border-radius:1rem!important;color:#120724!important}
input:not([type=checkbox]):not([type=radio]):focus,select:focus,textarea:focus,.bd-input:focus{border-color:#A855F7!important;box-shadow:0 0 0 4px rgba(168,85,247,.16)!important;outline:none!important}
.bd-mobile-bottom-nav,.bd-bottom-nav{border:1px solid rgba(124,58,237,.18)!important;background:rgba(255,255,255,.94)!important;box-shadow:0 -18px 45px rgba(43,16,85,.18)!important;backdrop-filter:blur(18px)}
.bd-bottom-nav-item-active{background:linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 100%)!important;color:#6D28D9!important}
'@
Set-Content -LiteralPath $cssPath -Value $css -Encoding UTF8

$globals = Get-Content -LiteralPath ".\app\globals.css" -Raw
if ($globals -notmatch "premium-purple.css") {
  $globals = $globals -replace '@import "../styles/bidra-theme.css";', '@import "../styles/bidra-theme.css";' + "`r`n" + '@import "../styles/premium-purple.css";'
  Set-Content -LiteralPath ".\app\globals.css" -Value $globals -Encoding UTF8
}

Write-Host "Phase 1 foundation patch applied."
