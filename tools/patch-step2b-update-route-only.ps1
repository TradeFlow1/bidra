#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

$path = Join-Path $repoRoot 'app\api\listings\[id]\update\route.ts'
if (-not (Test-Path -LiteralPath $path)) { throw "Missing file: $path" }

$rows = Get-Content -LiteralPath $path
$out = New-Object System.Collections.Generic.List[string]

foreach ($line in $rows) {
    $out.Add($line)

    if ($line -eq '    const imagesRaw = Array.isArray(body.images) ? body.images : [];') {
        $out.Add('    const pickupAvailabilityRaw = Array.isArray(body.pickupAvailability) ? body.pickupAvailability : [];')
        $out.Add('    const pickupAvailability = pickupAvailabilityRaw.map(function (v: any) { return String(v ?? "").trim(); }).filter(Boolean).slice(0, 3);')
    }

    if ($line -eq '    if (images.length > 10) return NextResponse.json({ error: "Too many images (max 10)." }, { status: 400 });') {
        $out.Add('    if (pickupAvailability.length < 3) return NextResponse.json({ error: "Please provide 3 pickup availability options." }, { status: 400 });')
    }

    if ($line -eq '      images: images,') {
        $out.Add('      pickupAvailability: pickupAvailability,')
        $out.Add('      pickupTimezone: "Australia/Brisbane",')
    }
}

[System.IO.File]::WriteAllLines($path, $out, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $path"
