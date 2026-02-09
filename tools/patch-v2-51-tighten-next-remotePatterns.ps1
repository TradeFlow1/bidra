#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $PSCommandPath
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }
    $p = Split-Path $p -Parent
  }
  throw 'Not at Bidra repo root (package.json not found)'
}

function Backup-File {
  param([string]$File)
  $bak = "$File.bak_v2_51_tighten_next_remotePatterns"
  if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
}

function Write-Utf8NoBomText {
  param([string]$File,[string]$Text)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $File), $Text, $utf8NoBom)
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$file = '.\next.config.mjs'
if (-not (Test-Path -LiteralPath $file)) { throw "Missing: $file" }

# Hard rewrite next.config.mjs (BOM-free)
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  images: {
    remotePatterns: [
      ...(isDev
        ? [
            { protocol: "http", hostname: "127.0.0.1", port: "3000" },
            { protocol: "http", hostname: "localhost", port: "3000" },
          ]
        : []),
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  output: "standalone",
};

export default nextConfig;
