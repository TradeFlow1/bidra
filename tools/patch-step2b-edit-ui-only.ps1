#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

$path = Join-Path $repoRoot 'app\sell\edit\[id]\edit-listing-client.tsx'
if (-not (Test-Path -LiteralPath $path)) { throw "Missing file: $path" }

$content = Get-Content -LiteralPath $path -Raw

if ($content -notmatch 'const seededPickup = ') {
    $content = $content.Replace(
'  const [status, setStatus] = useState<SellerStatus>(normalizeStatus(listing.status));',
'  const [status, setStatus] = useState<SellerStatus>(normalizeStatus(listing.status));
  const seededPickup = Array.isArray((listing as any).pickupAvailability) ? (listing as any).pickupAvailability.map(function (x: any) { return String(x || ""); }) : ["", "", ""];
  const [pickup1, setPickup1] = useState(seededPickup[0] || "");
  const [pickup2, setPickup2] = useState(seededPickup[1] || "");
  const [pickup3, setPickup3] = useState(seededPickup[2] || "");'
    )
}

if ($content -notmatch 'Please provide 3 pickup availability options\.') {
    $content = $content.Replace(
'    if (total > 10) return "Too many images (max 10 total).";',
'    if (total > 10) return "Too many images (max 10 total).";
    if (!pickup1.trim() || !pickup2.trim() || !pickup3.trim()) return "Please provide 3 pickup availability options.";'
    )
}

if ($content -notmatch 'pickupAvailability: \[pickup1, pickup2, pickup3\]') {
    $content = $content.Replace(
'                    status,',
'                    status,
                    pickupAvailability: [pickup1, pickup2, pickup3].map(function (v) { return String(v || "").trim(); }).filter(Boolean),'
    )
}

if ($content -notmatch 'Pickup availability</label>') {
    $content = $content.Replace(
'          {error ? (',
'          <div className="grid gap-2">
            <label className="text-sm font-semibold bd-ink">Pickup availability</label>
            <div className="text-xs bd-ink2">Add 3 pickup options buyers can choose from after purchase.</div>
            <input type="datetime-local" className="bd-input" value={pickup1} onChange={(e) => setPickup1(e.target.value)} />
            <input type="datetime-local" className="bd-input" value={pickup2} onChange={(e) => setPickup2(e.target.value)} />
            <input type="datetime-local" className="bd-input" value={pickup3} onChange={(e) => setPickup3(e.target.value)} />
          </div>

          {error ? ('
    )
}

[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $path"
