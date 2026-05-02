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

$card = [regex]::Replace($card, 'if \(v\.indexOf\("[^"]*"\) >= 0\) return v\.split\("[^"]*"\)\.pop\(\) \|\| v;', 'if (v.indexOf(" > ") >= 0) return v.split(" > ").pop() || v;')
$card = [regex]::Replace($card, 'return "[^"]*"\.repeat\(full\) \+ "[^"]*"\.repeat\(5 - full\);', 'return String(full) + "/5";')

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $cardPath), ($card.TrimEnd() + [Environment]::NewLine), $utf8NoBom)

$check = Get-Content $checkPath -Raw

if ($check -notlike '*String(full) + "/5"*') {
    $check = $check.Replace('  "showWatchButton",', '  "showWatchButton",
  "String(full) + \"\/5\"",')
}

$badMarkers = @(
    'Ã',
    'Â',
    'â',
    '★',
    '☆'
)

foreach ($marker in $badMarkers) {
    if ($check -notlike ('*' + $marker + '*')) {
        $needle = 'const forbidden = ['
        $replacement = 'const forbidden = [' + [Environment]::NewLine + '  "' + $marker + '",'
        $check = $check.Replace($needle, $replacement)
    }
}

[System.IO.File]::WriteAllText((Resolve-Path $checkPath), ($check.TrimEnd() + [Environment]::NewLine), $utf8NoBom)

node .\tools\listing-04-card-conversion-check.cjs
Write-Host 'Cleaned LISTING-04 encoding regression using ASCII-safe card text.'
git --no-pager diff -- components/listing-card.tsx
git status --short
