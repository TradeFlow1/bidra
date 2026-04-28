$ErrorActionPreference = "Stop"

$ExpectedRoot = "C:\Users\jpdup\Documents\Bidra\bidra-main-git"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$ResolvedRepoRoot = (Resolve-Path $RepoRoot).Path
$ResolvedExpectedRoot = (Resolve-Path $ExpectedRoot).Path

if ($ResolvedRepoRoot -ine $ResolvedExpectedRoot) {
    throw "Refusing to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git. Script resolved repo root as: $ResolvedRepoRoot"
}

Set-Location -Path $ResolvedRepoRoot

if (-not (Test-Path ".\package.json")) {
    throw "package.json not found at repo root."
}

$Branch = (git branch --show-current).Trim()

if ($Branch -ne "fix/PRODUCT-01-marketplace-promise") {
    throw "Wrong branch. Expected fix/PRODUCT-01-marketplace-promise but found $Branch"
}

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Write-Utf8NoBomText {
    param(
        [string]$RelativePath,
        [string]$Text
    )

    $FullPath = [System.IO.Path]::GetFullPath((Join-Path $ResolvedRepoRoot $RelativePath))
    [System.IO.File]::WriteAllText($FullPath, $Text, $Utf8NoBom)
}

function Write-Utf8NoBomLines {
    param(
        [string]$RelativePath,
        [string[]]$Lines
    )

    Write-Utf8NoBomText -RelativePath $RelativePath -Text (($Lines -join [Environment]::NewLine) + [Environment]::NewLine)
}

function Update-TextFile {
    param(
        [string]$RelativePath,
        [hashtable]$Replacements
    )

    $FullPath = [System.IO.Path]::GetFullPath((Join-Path $ResolvedRepoRoot $RelativePath))

    if (-not (Test-Path $FullPath)) {
        throw ("Missing file: " + $RelativePath)
    }

    $Text = [System.IO.File]::ReadAllText($FullPath, [System.Text.Encoding]::UTF8)

    foreach ($Old in $Replacements.Keys) {
        $New = $Replacements[$Old]

        if (-not $Text.Contains($Old)) {
            throw ("Expected text not found in " + $RelativePath + ": " + $Old)
        }

        $Text = $Text.Replace($Old, $New)
    }

    Write-Utf8NoBomText -RelativePath $RelativePath -Text $Text
}

$FooterReplacements = @{}
$FooterReplacements["Buy now. Make offers.</h2>"] = "Buy now. Make offers. Arrange handover.</h2>"
$FooterReplacements["Trust-first marketplace for straightforward buying and highest-offer listings."] = "Trust-first local marketplace for Buy Now sales and seller-accepted offers. Buyers and sellers arrange pickup or postage in messages."
$FooterReplacements["Buy now. Make offers.</p>"] = "Buy now. Make offers. Arrange handover in messages.</p>"
Update-TextFile -RelativePath "components\site-footer.tsx" -Replacements $FooterReplacements

$HowReplacements = @{}
$HowReplacements["Bidra is an Australian marketplace where people list items and connect directly. We are the platform only. We are not the seller, and we do not automatically award a winner."] = "Bidra is an Australian trust-first local marketplace. Users list items, buyers can use Buy Now or make offers, and buyers and sellers arrange pickup or postage in messages. Bidra is the platform only: we are not the seller, auctioneer, escrow holder, payment provider, shipping provider, or pickup scheduler."
$HowReplacements["Bidra is not the seller, auctioneer, escrow holder, or shipping provider."] = "Bidra is not the seller, auctioneer, escrow holder, payment provider, shipping provider, or pickup scheduler."
$HowReplacements["After the item is sold, use messages to arrange pickup or postage, then leave feedback or report an issue if needed."] = "After the item is sold, use messages to arrange pickup or postage. Orders are sold-item records, not forced payment, shipping, or pickup-scheduling workflows."
$HowReplacements["Buyer commits to complete the purchase under Bidra&apos;s rules."] = "Buyer commits to follow Bidra&apos;s marketplace rules and arrange handover in messages."
$HowReplacements["For Buy Now purchases, the item is sold immediately. Use messages to arrange pickup or postage, then leave feedback or report an issue if needed."] = "For Buy Now purchases, the item is sold immediately. Use messages to arrange pickup or postage; Bidra does not run in-app payment, escrow, shipping, or pickup scheduling."
$HowReplacements["There is no in-app payment, escrow, shipping, or pickup scheduling step in Bidra V1."] = "There is no in-app payment, escrow, shipping, pickup scheduling, or forced completion workflow in Bidra V1."
$HowReplacements["Items are sold by users, and we are not an auctioneer, escrow holder, shipping provider, or payment provider."] = "Items are sold by users, and we are not an auctioneer, escrow holder, payment provider, shipping provider, or pickup scheduler."
Update-TextFile -RelativePath "app\how-it-works\page.tsx" -Replacements $HowReplacements

$SupportReplacements = @{}
$SupportReplacements["Bidra is a community marketplace. We work hard to keep it safe, but buyers and sellers should still use common sense and follow strong safety habits."] = "Bidra is a trust-first local marketplace. We provide listing, offer, messaging, reporting, and sold-item record tools, but buyers and sellers remain responsible for pickup, postage, payment, and handover decisions."
$SupportReplacements["Keep communication and transaction steps on-platform wherever possible."] = "Keep important listing, pickup, postage, payment, and handover details in Bidra messages wherever possible."
$SupportReplacements["Most issues are resolved between buyer and seller. If you cannot resolve it, contact Support with your order ID, listing link, messages, and evidence. Bidra may take platform actions such as removing listings or restricting accounts, but does not act as a seller, escrow holder, shipping provider, or payment provider."] = "Most issues are resolved between buyer and seller. If you cannot resolve it, contact Support with your order ID, listing link, messages, and evidence. Bidra may take platform actions such as removing listings or restricting accounts, but does not act as a seller, escrow holder, payment provider, shipping provider, or pickup scheduler."
Update-TextFile -RelativePath "app\support\page.tsx" -Replacements $SupportReplacements

$TermsReplacements = @{}
$TermsReplacements["These Terms govern your use of Bidra. By accessing or using Bidra, you agree to these Terms. Bidra is a marketplace platform only. We are not the seller of items and not a payment provider."] = "These Terms govern your use of Bidra. By accessing or using Bidra, you agree to these Terms. Bidra is a marketplace platform only. We are not the seller of items, an auctioneer, an escrow holder, a payment provider, a shipping provider, or a pickup scheduler."
$TermsReplacements["Orders are sold-item records. Buyers and sellers arrange pickup or postage in messages."] = "Orders are sold-item records. Buyers and sellers arrange pickup, postage, payment, and handover details in messages."
$TermsReplacements["Bidra does not run in-app payment, escrow, pickup scheduling, or completion workflows."] = "Bidra does not run in-app payment, escrow, shipping, pickup scheduling, or forced completion workflows."
Update-TextFile -RelativePath "app\legal\terms\page.tsx" -Replacements $TermsReplacements

$CheckPath = "tools\product-01-marketplace-promise-check.cjs"
$CheckLines = @(
    'const fs = require("fs");',
    'const path = require("path");',
    '',
    'const repoRoot = path.resolve(__dirname, "..");',
    '',
    'function fail(message) {',
    '  console.error("[PRODUCT-01] FAIL: " + message);',
    '  process.exitCode = 1;',
    '}',
    '',
    'function pass(message) {',
    '  console.log("[PRODUCT-01] PASS: " + message);',
    '}',
    '',
    'function read(relativePath) {',
    '  const fullPath = path.join(repoRoot, relativePath);',
    '  if (!fs.existsSync(fullPath)) {',
    '    fail("Missing file: " + relativePath);',
    '    return "";',
    '  }',
    '  return fs.readFileSync(fullPath, "utf8");',
    '}',
    '',
    'const files = [',
    '  "app/how-it-works/page.tsx",',
    '  "app/support/page.tsx",',
    '  "app/legal/terms/page.tsx",',
    '  "components/site-footer.tsx"',
    '];',
    '',
    'const combined = files.map(read).join("\n");',
    '',
    'const requiredPhrases = [',
    '  "trust-first local marketplace",',
    '  "Buy Now",',
    '  "make offers",',
    '  "arrange pickup or postage",',
    '  "Bidra is the platform only",',
    '  "not the seller",',
    '  "auctioneer",',
    '  "escrow holder",',
    '  "payment provider",',
    '  "shipping provider",',
    '  "pickup scheduler",',
    '  "Orders are sold-item records"',
    '];',
    '',
    'for (const phrase of requiredPhrases) {',
    '  if (!combined.includes(phrase)) {',
    '    fail("Missing approved marketplace promise phrase: " + phrase);',
    '  } else {',
    '    pass("Found approved marketplace promise phrase: " + phrase);',
    '  }',
    '}',
    '',
    'const forbiddenPatterns = [',
    '  /pickup is scheduled in-app/i,',
    '  /pickup timing is scheduled in-app/i,',
    '  /scheduled in-app/i,',
    '  /in-app payment step/i,',
    '  /complete the order inside Bidra/i,',
    '  /follow the order flow/i,',
    '  /payment protection/i,',
    '  /Bidra escrow/i,',
    '  /escrow service/i',
    '];',
    '',
    'for (const pattern of forbiddenPatterns) {',
    '  if (pattern.test(combined)) {',
    '    fail("Forbidden V2 or unsupported promise remains: " + pattern);',
    '  } else {',
    '    pass("Forbidden promise absent: " + pattern);',
    '  }',
    '}',
    '',
    'if (process.exitCode) {',
    '  process.exit(process.exitCode);',
    '}',
    '',
    'console.log("[PRODUCT-01] Marketplace promise check completed.");'
)
Write-Utf8NoBomLines -RelativePath $CheckPath -Lines $CheckLines

Write-Host "PRODUCT-01 patch applied."
git diff --stat
node .\tools\product-01-marketplace-promise-check.cjs
