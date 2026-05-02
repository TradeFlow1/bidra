$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

if (-not (Test-Path '.\package.json')) {
    throw 'Run this only from the Bidra repo root.'
}

if ((git branch --show-current) -ne 'fix/SELLER-02-profile-confidence') {
    throw 'Expected branch fix/SELLER-02-profile-confidence.'
}

$pagePath = '.\app\seller\[id]\page.tsx'
$checkPath = '.\tools\seller-02-profile-confidence-check.cjs'
$page = Get-Content -LiteralPath $pagePath -Raw

$oldStars = @(
    'function renderStars(avg: number) {',
    '  const safe = Math.max(0, Math.min(5, avg));',
    '  const full = Math.round(safe);',
    '  return "â˜…".repeat(full) + "â˜†".repeat(5 - full);',
    '}'
)
$oldStarsText = [string]::Join([Environment]::NewLine, $oldStars)
$newStars = @(
    'function renderStars(avg: number) {',
    '  const safe = Math.max(0, Math.min(5, avg));',
    '  const rounded = Math.round(safe * 10) / 10;',
    '  return `${rounded.toFixed(1)}/5`; ',
    '}'
)
$newStarsText = [string]::Join([Environment]::NewLine, $newStars)
if (-not $page.Contains($oldStarsText)) {
    throw 'Could not find expected renderStars block.'
}
$page = $page.Replace($oldStarsText, $newStarsText)

$oldDerived = @(
    '  const ratingAvg = typeof sellerRating._avg.rating === "number" ? Number(sellerRating._avg.rating) : null;',
    '  const ratingCount = Number(sellerRating._count.rating || 0);',
    '  const visibleRecentFeedback = recentFeedback.filter((entry) => cleanText(entry.comment).length > 0);'
)
$oldDerivedText = [string]::Join([Environment]::NewLine, $oldDerived)
$newDerived = @(
    '  const ratingAvg = typeof sellerRating._avg.rating === "number" ? Number(sellerRating._avg.rating) : null;',
    '  const ratingCount = Number(sellerRating._count.rating || 0);',
    '  const profileSignals = [',
    '    seller.emailVerified ? "Email verified" : "",',
    '    sellerPhoneVerified ? "Phone verified" : "",',
    '    sellerMemberSince ? `Member since ${sellerMemberSince}` : "",',
    '    sellerLocation ? `Location shown: ${sellerLocation}` : "",',
    '    completedSales > 0 ? `${completedSales} completed ${completedSales === 1 ? "sale" : "sales"}` : "",',
    '    ratingAvg !== null && ratingCount > 0 ? `${renderStars(ratingAvg)} from ${ratingCount} ${ratingCount === 1 ? "review" : "reviews"}` : "",',
    '  ].filter(Boolean);',
    '  const visibleRecentFeedback = recentFeedback.filter((entry) => cleanText(entry.comment).length > 0);'
)
$newDerivedText = [string]::Join([Environment]::NewLine, $newDerived)
if (-not $page.Contains($oldDerivedText)) {
    throw 'Could not find expected derived seller signal block.'
}
$page = $page.Replace($oldDerivedText, $newDerivedText)

$oldIntro = @(
    '              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Seller profile</div>',
    '              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">{sellerName}</h1>',
    '              {username ? <p className="mt-1 text-sm font-medium text-neutral-600">@{username}</p> : null}'
)
$oldIntroText = [string]::Join([Environment]::NewLine, $oldIntro)
$newIntro = @(
    '              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Seller profile</div>',
    '              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">{sellerName}</h1>',
    '              {username ? <p className="mt-1 text-sm font-medium text-neutral-600">@{username}</p> : null}',
    '              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">Review this seller profile before you message, buy, or make an offer. Bidra highlights verified contact signals, transaction history, active listings, and recent completed-order feedback where available.</p>'
)
$newIntroText = [string]::Join([Environment]::NewLine, $newIntro)
if (-not $page.Contains($oldIntroText)) {
    throw 'Could not find expected seller intro block.'
}
$page = $page.Replace($oldIntroText, $newIntroText)

$oldShareClose = @(
    '          <div className="mt-4 max-w-md">',
    '            <ShareActions',
    '              url={sellerUrl}',
    '              title={`${sellerName} on Bidra`}',
    '              text={`Check out ${sellerName}''s seller profile on Bidra.`}',
    '              label="Share seller profile"',
    '              description="Share this seller profile."',
    '            />',
    '          </div>',
    '        </section>'
)
$oldShareCloseText = [string]::Join([Environment]::NewLine, $oldShareClose)
$newShareClose = @(
    '          <div className="mt-4 max-w-md">',
    '            <ShareActions',
    '              url={sellerUrl}',
    '              title={`${sellerName} on Bidra`}',
    '              text={`Check out ${sellerName}''s seller profile on Bidra.`}',
    '              label="Share seller profile"',
    '              description="Share this seller profile."',
    '            />',
    '          </div>',
    '',
    '          <div className="mt-5 rounded-2xl border border-[#D8E1F0] bg-white p-4 shadow-sm">',
    '            <div className="text-sm font-bold text-neutral-950">Buyer confidence checklist</div>',
    '            <p className="mt-1 text-sm text-neutral-600">Use these signals together before arranging pickup, postage, or payment outside Bidra.</p>',
    '            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">',
    '              {profileSignals.length > 0 ? profileSignals.map((signal) => (',
    '                <div key={signal} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700">{signal}</div>',
    '              )) : (',
    '                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700">No profile signals yet</div>',
    '              )}',
    '            </div>',
    '            <div className="mt-3 grid gap-3 text-xs text-neutral-600 sm:grid-cols-3">',
    '              <div><span className="font-bold text-neutral-900">Check listings.</span> Compare active items, descriptions, photos, and price clarity.</div>',
    '              <div><span className="font-bold text-neutral-900">Message clearly.</span> Ask about condition, handover, postage, and what is included.</div>',
    '              <div><span className="font-bold text-neutral-900">Stay safe.</span> Keep arrangements in Messages and use safe public handover locations.</div>',
    '            </div>',
    '          </div>',
    '        </section>'
)
$newShareCloseText = [string]::Join([Environment]::NewLine, $newShareClose)
if (-not $page.Contains($oldShareCloseText)) {
    throw 'Could not find expected share/section close block.'
}
$page = $page.Replace($oldShareCloseText, $newShareCloseText)

$page = $page.Replace('Browse what this seller currently has available on Bidra.', 'Browse active items from this seller and compare price, condition, location, and offer activity before contacting them.')
$page = $page.Replace('This seller has no active listings right now.', 'This seller has no active listings right now. You can still review their profile signals and recent completed-order feedback where available.')

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $pagePath), ($page.TrimEnd() + [Environment]::NewLine), $utf8NoBom)

$checkLines = @(
    'const fs = require("fs");',
    'const path = require("path");',
    '',
    'const repoRoot = path.resolve(__dirname, "..");',
    'const pagePath = path.join(repoRoot, "app", "seller", "[id]", "page.tsx");',
    'const page = fs.readFileSync(pagePath, "utf8");',
    '',
    'const required = [',
    '  "Buyer confidence checklist",',
    '  "Review this seller profile before you message, buy, or make an offer.",',
    '  "verified contact signals, transaction history, active listings, and recent completed-order feedback",',
    '  "Use these signals together before arranging pickup, postage, or payment outside Bidra.",',
    '  "profileSignals",',
    '  "No profile signals yet",',
    '  "Check listings.",',
    '  "Message clearly.",',
    '  "Stay safe.",',
    '  "Keep arrangements in Messages and use safe public handover locations.",',
    '  "toFixed(1)",',
    '  "completed-order feedback where available",',
    '];',
    '',
    'const forbidden = [',
    '  "â˜…",',
    '  "â˜†",',
    '  "★",',
    '  "☆",',
    '];',
    '',
    'const missing = required.filter((needle) => !page.includes(needle));',
    'const presentForbidden = forbidden.filter((needle) => page.includes(needle));',
    '',
    'if (missing.length > 0 || presentForbidden.length > 0) {',
    '  console.error("SELLER-02 profile confidence check failed.");',
    '  for (const item of missing) console.error(`Missing: ${item}`);',
    '  for (const item of presentForbidden) console.error(`Forbidden: ${item}`);',
    '  process.exit(1);',
    '}',
    '',
    'console.log("SELLER-02 profile confidence check passed.");'
)

[System.IO.File]::WriteAllLines((Join-Path (Resolve-Path '.\tools') 'seller-02-profile-confidence-check.cjs'), $checkLines, $utf8NoBom)

node .\tools\seller-02-profile-confidence-check.cjs
Write-Host 'Patched SELLER-02 profile confidence.'
git --no-pager diff --stat
