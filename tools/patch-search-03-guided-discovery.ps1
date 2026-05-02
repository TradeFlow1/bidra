$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

if (-not (Test-Path '.\package.json')) {
    throw 'Run this only from the Bidra repo root.'
}

if ((git branch --show-current) -ne 'fix/SEARCH-03-guided-discovery') {
    throw 'Expected branch fix/SEARCH-03-guided-discovery.'
}

$pagePath = '.\app\listings\page.tsx'
$checkPath = '.\tools\search-03-guided-discovery-check.cjs'
$page = Get-Content $pagePath -Raw

$oldShortcuts = @(
    '              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Popular marketplace shortcuts</h2>',
    '              <div className="mt-3 flex flex-wrap gap-2">',
    '                {categoryShortcuts.map(function (label) {'
)
$oldShortcutsText = [string]::Join([Environment]::NewLine, $oldShortcuts)

$newShortcuts = @(
    '              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Guided discovery shortcuts</h2>',
    '              <p className="mt-1 text-xs text-[#64748B]">Start broad, then narrow by category, Buy Now, offers, or local pickup confidence.</p>',
    '              <div className="mt-3 flex flex-wrap gap-2">',
    '                <Link href="/listings" className="bd-mobile-tap-target inline-flex items-center rounded-full border border-[#D8E1F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0F172A]">All active listings</Link>',
    '                <Link href={buildHref({ q, category, location, condition, min, max, sort, type: "BUY_NOW" })} className="bd-mobile-tap-target inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">Buy Now deals</Link>',
    '                <Link href={buildHref({ q, category, location, condition, min, max, sort, type: "OFFERABLE" })} className="bd-mobile-tap-target inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Offer listings</Link>',
    '                {categoryShortcuts.map(function (label) {'
)
$newShortcutsText = [string]::Join([Environment]::NewLine, $newShortcuts)

if (-not $page.Contains($oldShortcutsText)) {
    throw 'Could not find expected shortcuts heading block.'
}

$page = $page.Replace($oldShortcutsText, $newShortcutsText)

$oldZero = @(
    '                  <div className="mx-auto max-w-md">',
    '                    <div className="text-lg font-bold text-[#0F172A]">{hasFilters ? "No trusted matches for those filters yet." : "No active listings yet"}</div>',
    '                    <p className="mt-2 text-sm text-[#475569]">',
    '                      {hasFilters ? "Try fewer filters, check spelling, or browse all active Australian marketplace listings. Bidra only shows active listings that are available to buy or make offers on, and sellers can create new buyer-ready listings anytime." : "New local listings will appear here as sellers publish active items for Buy Now or offers."}',
    '                    </p>',
    '                    <div className="mt-4 flex flex-wrap justify-center gap-2">',
    '                      <Link href="/listings" className="bd-btn bd-btn-primary">Browse all listings</Link>',
    '                    </div>',
    '                  </div>'
)
$oldZeroText = [string]::Join([Environment]::NewLine, $oldZero)

$newZero = @(
    '                  <div className="mx-auto max-w-2xl">',
    '                    <div className="text-lg font-bold text-[#0F172A]">{hasFilters ? "No trusted matches for those filters yet." : "No active listings yet"}</div>',
    '                    <p className="mt-2 text-sm text-[#475569]">',
    '                      {hasFilters ? "Try a broader search path: remove one filter, check spelling, browse Buy Now, or scan offer listings. Bidra only shows active listings that are available to buy or make offers on." : "New local listings will appear here as sellers publish active items for Buy Now or offers. Start with broad discovery links while the marketplace fills up."}',
    '                    </p>',
    '                    <div className="mt-5 grid gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-left sm:grid-cols-3">',
    '                      <div>',
    '                        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">Broaden</div>',
    '                        <p className="mt-1 text-xs text-[#475569]">Clear filters first, then add category or location back one at a time.</p>',
    '                      </div>',
    '                      <div>',
    '                        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">Compare</div>',
    '                        <p className="mt-1 text-xs text-[#475569]">Check Buy Now for fast purchases or Offers when you want seller-reviewed interest.</p>',
    '                      </div>',
    '                      <div>',
    '                        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">Search safely</div>',
    '                        <p className="mt-1 text-xs text-[#475569]">Use clear keywords, suburb or postcode, and trusted seller signals before messaging.</p>',
    '                      </div>',
    '                    </div>',
    '                    <div className="mt-4 flex flex-wrap justify-center gap-2">',
    '                      <Link href="/listings" className="bd-btn bd-btn-primary">Browse all listings</Link>',
    '                      <Link href={buildHref({ type: "BUY_NOW" })} className="bd-btn bd-btn-secondary">Browse Buy Now</Link>',
    '                      <Link href={buildHref({ type: "OFFERABLE" })} className="bd-btn bd-btn-secondary">Browse offers</Link>',
    '                    </div>',
    '                  </div>'
)
$newZeroText = [string]::Join([Environment]::NewLine, $newZero)

if (-not $page.Contains($oldZeroText)) {
    throw 'Could not find expected zero-state block.'
}

$page = $page.Replace($oldZeroText, $newZeroText)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $pagePath), ($page.TrimEnd() + [Environment]::NewLine), $utf8NoBom)

$checkLines = @(
    'const fs = require("fs");',
    'const path = require("path");',
    '',
    'const repoRoot = path.resolve(__dirname, "..");',
    'const pagePath = path.join(repoRoot, "app", "listings", "page.tsx");',
    'const page = fs.readFileSync(pagePath, "utf8");',
    '',
    'const required = [',
    '  "Guided discovery shortcuts",',
    '  "Start broad, then narrow by category, Buy Now, offers, or local pickup confidence.",',
    '  "All active listings",',
    '  "Buy Now deals",',
    '  "Offer listings",',
    '  "Try a broader search path",',
    '  "Broaden",',
    '  "Compare",',
    '  "Search safely",',
    '  "Browse Buy Now",',
    '  "Browse offers",',
    '  "bd-mobile-tap-target",',
    '];',
    '',
    'const forbidden = [',
    '  "Popular marketplace shortcuts",',
    '  "Try fewer filters, check spelling, or browse all active Australian marketplace listings.",',
    '];',
    '',
    'const missing = required.filter((needle) => !page.includes(needle));',
    'const presentForbidden = forbidden.filter((needle) => page.includes(needle));',
    '',
    'if (missing.length > 0 || presentForbidden.length > 0) {',
    '  console.error("SEARCH-03 guided discovery check failed.");',
    '  for (const item of missing) console.error(`Missing: ${item}`);',
    '  for (const item of presentForbidden) console.error(`Forbidden: ${item}`);',
    '  process.exit(1);',
    '}',
    '',
    'console.log("SEARCH-03 guided discovery check passed.");'
)

[System.IO.File]::WriteAllLines((Resolve-Path $checkPath), $checkLines, $utf8NoBom)

node .\tools\search-03-guided-discovery-check.cjs
Write-Host 'Patched SEARCH-03 guided discovery.'
git --no-pager diff --stat
