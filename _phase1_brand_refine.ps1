$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
if (!(Test-Path -LiteralPath ".\package.json") -or !(Test-Path -LiteralPath ".\.git")) { throw "Refusing to run: not repo root." }

$MarkPath = ".\public\brand\bidra-kids-bird-mark.svg"
$MarkLines = @(
'<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">'
'  <defs>'
'    <linearGradient id="p" x1="92" y1="82" x2="420" y2="430" gradientUnits="userSpaceOnUse">'
'      <stop stop-color="#C4B5FD"/>'
'      <stop offset="0.45" stop-color="#7C3AED"/>'
'      <stop offset="1" stop-color="#4C1D95"/>'
'    </linearGradient>'
'  </defs>'
'  <path d="M86 246C86 151 164 96 257 106C350 116 428 187 418 272C407 356 339 414 239 402C148 391 86 341 86 246Z" stroke="url(#p)" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>'
'  <path d="M214 264C244 229 309 220 340 244C365 264 348 301 312 315C276 329 244 314 214 286C205 278 205 274 214 264Z" stroke="url(#p)" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>'
'  <path d="M197 184C184 199 189 222 207 225C225 228 236 209 231 193" stroke="#DDD6FE" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>'
'  <path d="M210 196L221 185" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/>'
'  <path d="M250 405V456" stroke="url(#p)" stroke-width="22" stroke-linecap="round"/>'
'  <path d="M294 405V456" stroke="url(#p)" stroke-width="22" stroke-linecap="round"/>'
'  <path d="M220 456H326" stroke="url(#p)" stroke-width="22" stroke-linecap="round"/>'
'</svg>'
)
Set-Content -LiteralPath $MarkPath -Value $MarkLines -Encoding UTF8

$BrandPath = ".\components\brand-logo.tsx"
$BrandLines = @(
'import Image from "next/image";'
'type BrandLogoProps = { className?: string; priority?: boolean; variant?: "full" | "symbol"; tone?: "dark" | "light"; };'
'export default function BrandLogo({ className, priority = false, variant = "full", tone = "dark" }: BrandLogoProps) {'
'  if (variant === "symbol") {'
'    return <Image src="/brand/bidra-kids-bird-mark.svg" alt="Bidra" width={96} height={96} priority={priority} unoptimized className={className || "h-10 w-10 object-contain"} />;'
'  }'
'  const textClass = tone === "light" ? "text-white" : "text-[#120724]";'
'  const subTextClass = tone === "light" ? "text-[#C4B5FD]" : "text-[#6D28D9]";'
'  return ('
'    <span className={className || "inline-flex items-center gap-3"}>'
'      <Image src="/brand/bidra-kids-bird-mark.svg" alt="" width={52} height={52} priority={priority} unoptimized className="h-12 w-12 shrink-0 object-contain" />'
'      <span className="leading-none">'
'        <span className={"block text-[32px] font-black tracking-[-0.06em] " + textClass}>Bidra</span>'
'        <span className={"mt-1 block text-[9px] font-black uppercase tracking-[0.32em] " + subTextClass}>Bid. Buy. Sell.</span>'
'      </span>'
'    </span>'
'  );'
'}'
)
Set-Content -LiteralPath $BrandPath -Value $BrandLines -Encoding UTF8

$CssPath = ".\styles\premium-purple.css"
$CssLines = @(
':root{--brand:#7C3AED;--brand-hover:#6D28D9;--brand-accent:#8B5CF6;--brand-soft:#F5F3FF;--brand-soft-2:#EDE9FE;--brand-border:#DDD6FE;--text-main:#120724;--text-muted:#62516F;--surface:#FFFFFF}'
'html{background:#FBF9FF}'
'body{background:linear-gradient(180deg,#FBF9FF 0%,#F7F2FF 36%,#FFFFFF 100%)!important;color:#120724!important}'
'.bd-premium-header{border-bottom:1px solid rgba(221,214,254,.70)!important;background:linear-gradient(135deg,rgba(18,7,36,.98) 0%,rgba(32,12,62,.97) 52%,rgba(76,29,149,.96) 100%)!important;color:#fff!important;box-shadow:0 16px 45px rgba(18,7,36,.18);backdrop-filter:blur(18px)}'
'.bd-premium-search{border-color:rgba(255,255,255,.16)!important;background:rgba(255,255,255,.10)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 12px 28px rgba(18,7,36,.20)!important}'
'.bd-premium-search::placeholder{color:rgba(255,255,255,.58)!important}'
'.bd-premium-footer{background:linear-gradient(135deg,#120724 0%,#1B0B33 52%,#2B1055 100%)!important;color:#fff!important}'
'.bd-btn-primary,.bd-primary-action,.bd-hero-primary-button{border-color:#7C3AED!important;background:linear-gradient(135deg,#8B5CF6 0%,#7C3AED 48%,#5B21B6 100%)!important;color:#fff!important;box-shadow:0 16px 34px rgba(124,58,237,.24)!important}'
'.bd-btn-secondary{border-color:rgba(124,58,237,.18)!important;background:#fff!important;color:#2B1055!important;box-shadow:0 12px 28px rgba(43,16,85,.07)!important}'
'.bd-card,.bd-form-card,.bd-empty-state,.bd-marketplace-section,.bd-surface,.bd-marketplace-card,.bd-listing-gallery-card,.bd-listing-under-gallery,.bd-page-hero{border-color:rgba(124,58,237,.14)!important;background:rgba(255,255,255,.98)!important;box-shadow:0 18px 50px rgba(43,16,85,.07)!important}'
'.bd-marketplace-card:hover,.bd-card-clickable:hover{border-color:rgba(124,58,237,.28)!important;box-shadow:0 24px 70px rgba(43,16,85,.11)!important;transform:translateY(-2px)}'
'input:not([type=checkbox]):not([type=radio]),select,textarea,.bd-input{border-color:rgba(124,58,237,.18)!important;border-radius:1rem!important;color:#120724!important}'
'input:not([type=checkbox]):not([type=radio]):focus,select:focus,textarea:focus,.bd-input:focus{border-color:#8B5CF6!important;box-shadow:0 0 0 4px rgba(139,92,246,.14)!important;outline:none!important}'
'.bd-mobile-bottom-nav,.bd-bottom-nav{border:1px solid rgba(124,58,237,.18)!important;background:rgba(255,255,255,.95)!important;box-shadow:0 -18px 45px rgba(43,16,85,.16)!important;backdrop-filter:blur(18px)}'
'.bd-bottom-nav-item-active{background:linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 100%)!important;color:#5B21B6!important}'
)
Set-Content -LiteralPath $CssPath -Value $CssLines -Encoding UTF8

$GlobalsPath = ".\app\globals.css"
$Globals = Get-Content -LiteralPath $GlobalsPath -Raw
$Needle = '@import "../styles/bidra-theme.css";'
$Insert = '@import "../styles/bidra-theme.css";' + [Environment]::NewLine + '@import "../styles/premium-purple.css";'
if ($Globals -notmatch "premium-purple.css") {
  $Globals = $Globals.Replace($Needle, $Insert)
  Set-Content -LiteralPath $GlobalsPath -Value $Globals -Encoding UTF8
}

if (Test-Path -LiteralPath ".\.next") { Remove-Item -LiteralPath ".\.next" -Recurse -Force }
Write-Host "Sober premium Bidra brand pass applied."
