$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

if (-not (Test-Path '.\package.json')) {
    throw 'Run this only from the Bidra repo root.'
}

if ((git branch --show-current) -ne 'fix/GROWTH-02-homepage-conversion') {
    throw 'Expected branch fix/GROWTH-02-homepage-conversion.'
}

$pagePath = '.\app\page.tsx'
$checkPath = '.\tools\growth-02-homepage-conversion-check.cjs'
$page = Get-Content $pagePath -Raw

$page = $page.Replace('Buy and sell locally with confidence', 'Buy now, make offers, and sell locally with confidence')
$page = $page.Replace('Bidra helps buyers and sellers move faster with clear listings, trusted profiles, and simple local handover.', 'Bidra is a trust-first marketplace for buyers who want simple local deals and sellers who want fast, serious offers.')
$page = $page.Replace('Browse active listings', 'Browse live deals')
$page = $page.Replace('No active listings yet. Create a free account and start the first trusted listing.', 'No active listings yet. Start the first trusted listing when you are ready to sell.')

$oldCtas = @(
    '                <Link href="/listings" className="bd-mobile-tap-target rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Browse live deals</Link>',
    '                <Link href="/auth/register" className="bd-mobile-tap-target rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Create a free account</Link>'
)
$oldCtaBlock = [string]::Join([Environment]::NewLine, $oldCtas)

$newCtas = @(
    '                <Link href="/listings" className="bd-mobile-tap-target rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Browse live deals</Link>',
    '                {userId ? (',
    '                  <Link href="/sell" className="bd-mobile-tap-target rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Sell an item</Link>',
    '                ) : (',
    '                  <Link href="/auth/register" className="bd-mobile-tap-target rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white">Create a free account</Link>',
    '                )}'
)
$newCtaBlock = [string]::Join([Environment]::NewLine, $newCtas)

if (-not $page.Contains($oldCtaBlock)) {
    throw 'Could not find expected homepage CTA block.'
}

$page = $page.Replace($oldCtaBlock, $newCtaBlock)

if ($page -notlike '*No buyer fees*') {
    $oldClosing = @(
        '              </div>',
        '            </div>'
    )
    $oldClosingBlock = [string]::Join([Environment]::NewLine, $oldClosing)

    $trustLines = @(
        '              <div className="grid gap-3 pt-2 text-sm text-slate-700 sm:grid-cols-3">',
        '                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">',
        '                  <p className="font-semibold text-slate-950">No buyer fees</p>',
        '                  <p className="mt-1">See the price, message the seller, and decide with confidence.</p>',
        '                </div>',
        '                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">',
        '                  <p className="font-semibold text-slate-950">Buy now or offer</p>',
        '                  <p className="mt-1">Choose instant purchase intent or make your strongest offer.</p>',
        '                </div>',
        '                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">',
        '                  <p className="font-semibold text-slate-950">Safer handover</p>',
        '                  <p className="mt-1">Use profiles, clear listing details, and local pickup planning.</p>',
        '                </div>',
        '              </div>'
    )
    $trustBlock = [string]::Join([Environment]::NewLine, $trustLines)
    $newClosingBlock = $trustBlock + [Environment]::NewLine + $oldClosingBlock

    $index = $page.IndexOf($oldClosingBlock)
    if ($index -lt 0) {
        throw 'Could not find expected hero CTA closing block.'
    }

    $page = $page.Remove($index, $oldClosingBlock.Length).Insert($index, $newClosingBlock)
}

Set-Content -Path $pagePath -Value $page -Encoding UTF8

$checkLines = @(
    'const fs = require("fs");',
    'const path = require("path");',
    '',
    'const repoRoot = path.resolve(__dirname, "..");',
    'const pagePath = path.join(repoRoot, "app", "page.tsx");',
    'const page = fs.readFileSync(pagePath, "utf8");',
    '',
    'const required = [',
    '  "Buy now, make offers, and sell locally with confidence",',
    '  "trust-first marketplace",',
    '  "Browse live deals",',
    '  "userId ? (",',
    '  "Sell an item",',
    '  "href=\"/auth/register\"",',
    '  "Create a free account",',
    '  "No buyer fees",',
    '  "Buy now or offer",',
    '  "Safer handover",',
    '  "priority",',
    '  "sizes=",',
    '];',
    '',
    'const forbidden = [',
    '  "No active listings yet. Create a free account and start the first trusted listing.",',
    '  "<Link href=\"/auth/register\" className=\"bd-mobile-tap-target rounded-2xl border border-[#D8E1F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white\">Create a free account</Link>\n              </div>",',
    '];',
    '',
    'const missing = required.filter((needle) => !page.includes(needle));',
    'const presentForbidden = forbidden.filter((needle) => page.includes(needle));',
    '',
    'if (missing.length > 0 || presentForbidden.length > 0) {',
    '  console.error("GROWTH-02 homepage conversion check failed.");',
    '  for (const item of missing) {',
    '    console.error(`Missing: ${item}`);',
    '  }',
    '  for (const item of presentForbidden) {',
    '    console.error(`Forbidden: ${item}`);',
    '  }',
    '  process.exit(1);',
    '}',
    '',
    'console.log("GROWTH-02 homepage conversion check passed.");'
)

Set-Content -Path $checkPath -Value $checkLines -Encoding UTF8
Write-Host 'Patched GROWTH-02 homepage conversion.'
node .\tools\growth-02-homepage-conversion-check.cjs
