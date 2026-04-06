#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )
    [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding($false)))
}

# 1) /account should lead to real settings page
$accountPath = Join-Path $repoRoot 'app\account\page.tsx'
$account = Get-Content -LiteralPath $accountPath -Raw
$account = $account.Replace('redirect("/auth/login?next=/dashboard");', 'redirect("/auth/login?next=/profile");')
$account = $account.Replace('redirect("/dashboard");', 'redirect("/profile");')
Write-Utf8NoBom -Path $accountPath -Content $account
Write-Host "[OK] patched $accountPath"

# 2) Add Profile link to account menu
$headerPath = Join-Path $repoRoot 'components\site-header-client.tsx'
$header = Get-Content -LiteralPath $headerPath -Raw
if ($header -notmatch 'href="/profile"') {
    $header = $header.Replace(
'        <Link href="/dashboard" className={menuLinkClass} onClick={closeMenu}>
          Dashboard
        </Link>',
'        <Link href="/dashboard" className={menuLinkClass} onClick={closeMenu}>
          Dashboard
        </Link>
        <Link href="/profile" className={menuLinkClass} onClick={closeMenu}>
          Profile
        </Link>'
    )
}
Write-Utf8NoBom -Path $headerPath -Content $header
Write-Host "[OK] patched $headerPath"

# 3) Remove payment-era payout section and server handling from /profile
$profilePath = Join-Path $repoRoot 'app\profile\page.tsx'
$p = Get-Content -LiteralPath $profilePath -Raw

# Remove payout input reads
$patterns = @(
'const payidEmail = String(formData.get("payidEmail") ?? "").trim().slice(0, 120);',
'const payidMobile = String(formData.get("payidMobile") ?? "").trim().slice(0, 32);',
'const bankName = String(formData.get("bankName") ?? "").trim().slice(0, 80);',
'const bankBsb = String(formData.get("bankBsb") ?? "").trim().slice(0, 16);',
'const bankAccount = String(formData.get("bankAccount") ?? "").trim().slice(0, 32);',
'    // ---- Payout details validation (optional) ----',
'    const payidEmailNorm = payidEmail.trim();',
'    const payidMobileDigits = payidMobile.replace(/[^\d]/g, "");',
'    const bankBsbDigits = bankBsb.replace(/[^\d]/g, "");',
'    const bankAccountDigits = bankAccount.replace(/[^\d]/g, "");',
'    const hasPayidEmail = payidEmailNorm.length > 0;',
'    const hasPayidMobile = payidMobileDigits.length > 0;',
'    const hasBankName = bankName.trim().length > 0;',
'    const hasBankBsb = bankBsbDigits.length > 0;',
'    const hasBankAccount = bankAccountDigits.length > 0;',
'    // PayID email: basic shape check',
'    if (hasPayidEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payidEmailNorm)) {',
'      redirect("/profile?saved=0");',
'    }',
'    // PayID mobile: AU mobile 04xxxxxxxx (10 digits total)',
'    if (hasPayidMobile) {',
'      if (!(payidMobileDigits.length === 10 && payidMobileDigits.startsWith("04"))) {',
'        // PayID mobile must be an AU mobile number',
'        redirect("/profile?saved=0");',
'      }',
'    }',
'    // Bank: if any bank field provided, require BSB + account and validate lengths',
'    if (hasBankName || hasBankBsb || hasBankAccount) {',
'      if (!hasBankBsb || !hasBankAccount) {',
'        redirect("/profile?saved=0");',
'      }',
'      if (bankBsbDigits.length !== 6) {',
'        redirect("/profile?saved=0");',
'      }',
'      if (bankAccountDigits.length < 6 || bankAccountDigits.length > 12) {',
'        redirect("/profile?saved=0");',
'      }',
'    }'
)

foreach ($pat in $patterns) {
    $p = $p.Replace($pat, '')
}

# Remove payout fields from update data
$dataPatterns = @(
'        payidEmail: payidEmail || null,',
'        payidMobile: (payidMobileDigits || "") ? payidMobileDigits : null,',
'        bankName: bankName || null,',
'        bankBsb: (bankBsbDigits || "") ? bankBsbDigits : null,',
'        bankAccount: (bankAccountDigits || "") ? bankAccountDigits : null,'
)
foreach ($pat in $dataPatterns) {
    $p = $p.Replace($pat, '')
}

# Remove payout UI block by targeting the card section
$startMarker = '<div className="bd-card p-5">'
$needle = '<div className="text-sm font-semibold">Payout details</div>'
$idxNeedle = $p.IndexOf($needle)
if ($idxNeedle -ge 0) {
    $idxStart = $p.LastIndexOf($startMarker, $idxNeedle)
    $idxEnd = $p.IndexOf('</div>' + "`r`n" + '</div>' + "`r`n" + '', $idxNeedle)
    if ($idxStart -ge 0 -and $idxEnd -gt $idxStart) {
        $removeLen = $idxEnd - $idxStart + 14
        $p = $p.Remove($idxStart, $removeLen)
    }
}

Write-Utf8NoBom -Path $profilePath -Content $p
Write-Host "[OK] patched $profilePath"
