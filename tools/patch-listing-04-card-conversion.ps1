$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

if (-not (Test-Path '.\package.json')) {
    throw 'Run this only from the Bidra repo root.'
}

if ((git branch --show-current) -ne 'fix/LISTING-04-card-conversion') {
    throw 'Expected branch fix/LISTING-04-card-conversion.'
}

$cardPath = '.\components\listing-card.tsx'
$checkPath = '.\tools\listing-04-card-conversion-check.cjs'
$card = Get-Content $cardPath -Raw

$card = $card.Replace('            {isTimedOffers ? "Offers" : hasBuyNow ? "Buy Now" : "Fixed"}', '            {isTimedOffers ? "Highest offers" : hasBuyNow ? "Buy Now" : "Fixed price"}')

$oldPriceBlock = @(
    '        <div className="text-[22px] font-extrabold tracking-tight text-[#0F172A]">{money(primaryCents)}</div>',
    '        {isTimedOffers ? (',
    '          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-[#64748B]">',
    '            <span>{currentOffer !== null ? `Current offer ${money(currentOffer)}` : "No offers yet"}</span>',
    '            {offerCount && offerCount > 0 ? <span>{offerCount} {offerCount === 1 ? "offer" : "offers"}</span> : null}',
    '          </div>',
    '        ) : null}'
)
$oldPriceText = [string]::Join([Environment]::NewLine, $oldPriceBlock)

$newPriceBlock = @(
    '        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">',
    '          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{isTimedOffers ? "Current best offer" : hasBuyNow ? "Buy now price" : "Price"}</div>',
    '          <div className="mt-1 text-[23px] font-extrabold tracking-tight text-[#0F172A]">{money(primaryCents)}</div>',
    '          <div className="mt-1 text-[11px] font-medium text-[#64748B]">',
    '            {isTimedOffers ? (',
    '              currentOffer !== null ? "Lead with your strongest offer." : "Be the first to make an offer." ',
    '            ) : hasBuyNow ? (',
    '              "Buy now before someone else does." ',
    '            ) : (',
    '              "Check details and message the seller." ',
    '            )}',
    '          </div>',
    '        </div>',
    '        {isTimedOffers ? (',
    '          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-[#64748B]">',
    '            <span>{currentOffer !== null ? `Current offer ${money(currentOffer)}` : "No offers yet"}</span>',
    '            <span>{offerCount && offerCount > 0 ? `${offerCount} ${offerCount === 1 ? "offer" : "offers"}` : "No offer history yet"}</span>',
    '          </div>',
    '        ) : null}'
)
$newPriceText = [string]::Join([Environment]::NewLine, $newPriceBlock)

if (-not $card.Contains($oldPriceText)) {
    throw 'Could not find expected price and offer block.'
}

$card = $card.Replace($oldPriceText, $newPriceText)

$oldFooter = @(
    '        <div className="flex items-center justify-between gap-2.5 text-[11px] text-[#64748B]">',
    '          <div className="min-w-0 truncate">{location || "Location on request"}</div>',
    '          <div className="flex items-center gap-2">',
    '            <div className="font-semibold text-[#0F172A]">View</div>'
)
$oldFooterText = [string]::Join([Environment]::NewLine, $oldFooter)

$newFooter = @(
    '        <div className="flex items-center justify-between gap-2.5 text-[11px] text-[#64748B]">',
    '          <div className="min-w-0 truncate">{location || "Location on request"}</div>',
    '          <div className="flex items-center gap-2">',
    '            <div className="font-semibold text-[#0F172A]">{isTimedOffers ? "View offers" : hasBuyNow ? "Buy now" : "View item"}</div>'
)
$newFooterText = [string]::Join([Environment]::NewLine, $newFooter)

if (-not $card.Contains($oldFooterText)) {
    throw 'Could not find expected footer CTA block.'
}

$card = $card.Replace($oldFooterText, $newFooterText)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $cardPath), ($card.TrimEnd() + [Environment]::NewLine), $utf8NoBom)

$checkLines = @(
    'const fs = require("fs");',
    'const path = require("path");',
    '',
    'const repoRoot = path.resolve(__dirname, "..");',
    'const cardPath = path.join(repoRoot, "components", "listing-card.tsx");',
    'const card = fs.readFileSync(cardPath, "utf8");',
    '',
    'const required = [',
    '  "Highest offers",',
    '  "Fixed price",',
    '  "Current best offer",',
    '  "Buy now price",',
    '  "Lead with your strongest offer.",',
    '  "Be the first to make an offer.",',
    '  "Buy now before someone else does.",',
    '  "No offer history yet",',
    '  "View offers",',
    '  "Buy now",',
    '  "View item",',
    '  "emailVerified",',
    '  "ratingAvg",',
    '  "showWatchButton",',
    '];',
    '',
    'const forbidden = [',
    '  "{isTimedOffers ? \"Offers\" : hasBuyNow ? \"Buy Now\" : \"Fixed\"}",',
    '  "<div className=\"font-semibold text-[#0F172A]\">View</div>",',
    '];',
    '',
    'const missing = required.filter((needle) => !card.includes(needle));',
    'const presentForbidden = forbidden.filter((needle) => card.includes(needle));',
    '',
    'if (missing.length > 0 || presentForbidden.length > 0) {',
    '  console.error("LISTING-04 card conversion check failed.");',
    '  for (const item of missing) console.error(`Missing: ${item}`);',
    '  for (const item of presentForbidden) console.error(`Forbidden: ${item}`);',
    '  process.exit(1);',
    '}',
    '',
    'console.log("LISTING-04 card conversion check passed.");'
)

[System.IO.File]::WriteAllLines((Resolve-Path '.\tools' | ForEach-Object { Join-Path $_ 'listing-04-card-conversion-check.cjs' }), $checkLines, $utf8NoBom)

node .\tools\listing-04-card-conversion-check.cjs
Write-Host 'Patched LISTING-04 listing card conversion.'
git --no-pager diff --stat
