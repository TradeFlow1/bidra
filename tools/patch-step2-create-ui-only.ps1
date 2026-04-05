#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

$path = Join-Path $repoRoot 'app\sell\new\sell-new-client.tsx'
if (-not (Test-Path -LiteralPath $path)) { throw "Missing file: $path" }

$rows = Get-Content -LiteralPath $path
$out = New-Object System.Collections.Generic.List[string]

foreach ($line in $rows) {
    if ($line -eq '  const router = useRouter();') {
        $out.Add($line)
        $out.Add('  const [pickup1, setPickup1] = useState("");')
        $out.Add('  const [pickup2, setPickup2] = useState("");')
        $out.Add('  const [pickup3, setPickup3] = useState("");')
        continue
    }

    if ($line -eq 'const imagesToSend = uploadedUrls;') {
        $out.Add($line)
        $out.Add('      const pickupAvailability = [pickup1, pickup2, pickup3].map(function (v) { return String(v || "").trim(); }).filter(Boolean);')
        continue
    }

    if ($line -eq '      // 2) Create listing') {
        $out.Add('      if (!pickup1.trim() -or !pickup2.trim() -or !pickup3.trim()) {')
        $out.Add('        setErr("Please provide 3 pickup availability options.");')
        $out.Add('        return;')
        $out.Add('      }')
        $out.Add('')
        $out.Add($line)
        continue
    }

    if ($line -eq '        body: JSON.stringify({') {
        $out.Add($line)
        $out.Add('          pickupAvailability: pickupAvailability,')
        continue
    }

    if ($line -eq '<p className="mt-2 text-sm bd-ink2">') {
        $out.Add('      <div className="mt-4 grid gap-2">')
        $out.Add('        <label className="text-sm font-semibold bd-ink">Pickup availability</label>')
        $out.Add('        <div className="text-xs bd-ink2">Add 3 pickup options buyers can choose from after purchase.</div>')
        $out.Add('        <input type="datetime-local" className="bd-input" value={pickup1} onChange={(e) => setPickup1(e.target.value)} />')
        $out.Add('        <input type="datetime-local" className="bd-input" value={pickup2} onChange={(e) => setPickup2(e.target.value)} />')
        $out.Add('        <input type="datetime-local" className="bd-input" value={pickup3} onChange={(e) => setPickup3(e.target.value)} />')
        $out.Add('      </div>')
        $out.Add('')
        $out.Add($line)
        continue
    }

    $out.Add($line)
}

[System.IO.File]::WriteAllLines($path, $out, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $path"
