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

# ---------- 1) create route ----------
$createRoute = Join-Path $repoRoot 'app\api\listings\create\route.ts'
$c = Get-Content -LiteralPath $createRoute -Raw
$c = $c.Replace(
'    const pickupAvailabilityRaw = Array.isArray(body.pickupAvailability) ? body.pickupAvailability : [];',
'    const pickupAvailabilityRaw = body.pickupAvailability && typeof body.pickupAvailability === "object" ? body.pickupAvailability : null;'
)
$c = $c.Replace(
'    const pickupAvailability = pickupAvailabilityRaw.map(function (v: any) { return String(v ?? "").trim(); }).filter(Boolean).slice(0, 3);',
'    const pickupAvailability = pickupAvailabilityRaw ? pickupAvailabilityRaw : null;'
)
$c = $c.Replace(
'    if (pickupAvailability.length < 3) return NextResponse.json({ error: "Please provide 3 pickup availability options." }, { status: 400 });',
'    if (!pickupAvailability || !Array.isArray((pickupAvailability as any).days) || !(pickupAvailability as any).days.length || !Array.isArray((pickupAvailability as any).timeBlocks) || !(pickupAvailability as any).timeBlocks.length) return NextResponse.json({ error: "Please provide seller pickup availability." }, { status: 400 });'
)
Write-Utf8NoBom -Path $createRoute -Content $c
Write-Host "[OK] patched $createRoute"

# ---------- 2) update route ----------
$updateRoute = Join-Path $repoRoot 'app\api\listings\[id]\update\route.ts'
$u = Get-Content -LiteralPath $updateRoute -Raw
$u = $u.Replace(
'    const pickupAvailabilityRaw = Array.isArray(body.pickupAvailability) ? body.pickupAvailability : [];',
'    const pickupAvailabilityRaw = body.pickupAvailability && typeof body.pickupAvailability === "object" ? body.pickupAvailability : null;'
)
$u = $u.Replace(
'    const pickupAvailability = pickupAvailabilityRaw.map(function (v: any) { return String(v ?? "").trim(); }).filter(Boolean).slice(0, 3);',
'    const pickupAvailability = pickupAvailabilityRaw ? pickupAvailabilityRaw : null;'
)
$u = $u.Replace(
'    if (pickupAvailability.length < 3) return NextResponse.json({ error: "Please provide 3 pickup availability options." }, { status: 400 });',
'    if (!pickupAvailability || !Array.isArray((pickupAvailability as any).days) || !(pickupAvailability as any).days.length || !Array.isArray((pickupAvailability as any).timeBlocks) || !(pickupAvailability as any).timeBlocks.length) return NextResponse.json({ error: "Please provide seller pickup availability." }, { status: 400 });'
)
Write-Utf8NoBom -Path $updateRoute -Content $u
Write-Host "[OK] patched $updateRoute"

# ---------- 3) create UI ----------
$newUi = Join-Path $repoRoot 'app\sell\new\sell-new-client.tsx'
$n = Get-Content -LiteralPath $newUi -Raw

$n = $n.Replace(
'      const pickupAvailability = [pickup1, pickup2, pickup3].map(function (v) { return String(v || "").trim(); }).filter(Boolean);',
'      const pickupAvailability = { days: pickupDays, timeBlocks: pickupTimeBlocks, notes: String(pickupNotes || "").trim() };'
)
$n = $n.Replace(
'      if (pickupAvailability.length < 3) {',
'      if (!pickupAvailability.days.length || !pickupAvailability.timeBlocks.length) {'
)
$n = $n.Replace(
'        setErr("Please provide 3 pickup availability options.");',
'        setErr("Please provide seller pickup availability.");'
)

$n = $n.Replace(
'        <input type="datetime-local" className="bd-input" value={pickup1} onChange={(e) => setPickup1(e.target.value)} />' + "`r`n" +
'        <input type="datetime-local" className="bd-input" value={pickup2} onChange={(e) => setPickup2(e.target.value)} />' + "`r`n" +
'        <input type="datetime-local" className="bd-input" value={pickup3} onChange={(e) => setPickup3(e.target.value)} />',
'        <div className="grid gap-3">' + "`r`n" +
'          <div>' + "`r`n" +
'            <div className="text-sm font-semibold bd-ink">Preferred pickup days</div>' + "`r`n" +
'            <div className="mt-2 flex flex-wrap gap-2">' + "`r`n" +
'              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(function (d) {' + "`r`n" +
'                const active = pickupDays.includes(d);' + "`r`n" +
'                return (' + "`r`n" +
'                  <button key={d} type="button" className={active ? "bd-btn bd-btn-primary" : "bd-btn bd-btn-ghost"} onClick={function () { setPickupDays(active ? pickupDays.filter(function (x) { return x !== d; }) : pickupDays.concat([d])); }}>' + "`r`n" +
'                    {d}' + "`r`n" +
'                  </button>' + "`r`n" +
'                );' + "`r`n" +
'              })}' + "`r`n" +
'            </div>' + "`r`n" +
'          </div>' + "`r`n" +
'          <div>' + "`r`n" +
'            <div className="text-sm font-semibold bd-ink">General pickup times</div>' + "`r`n" +
'            <div className="mt-2 flex flex-wrap gap-2">' + "`r`n" +
'              {["Morning","Afternoon","Evening"].map(function (b) {' + "`r`n" +
'                const active = pickupTimeBlocks.includes(b);' + "`r`n" +
'                return (' + "`r`n" +
'                  <button key={b} type="button" className={active ? "bd-btn bd-btn-primary" : "bd-btn bd-btn-ghost"} onClick={function () { setPickupTimeBlocks(active ? pickupTimeBlocks.filter(function (x) { return x !== b; }) : pickupTimeBlocks.concat([b])); }}>' + "`r`n" +
'                    {b}' + "`r`n" +
'                  </button>' + "`r`n" +
'                );' + "`r`n" +
'              })}' + "`r`n" +
'            </div>' + "`r`n" +
'          </div>' + "`r`n" +
'          <div>' + "`r`n" +
'            <label className="text-sm font-semibold bd-ink">Pickup notes (optional)</label>' + "`r`n" +
'            <textarea className="bd-input mt-2 min-h-[88px]" value={pickupNotes} onChange={(e) => setPickupNotes(e.target.value)} placeholder="Example: Weeknights after work, Saturday mornings, flexible with notice." />' + "`r`n" +
'          </div>' + "`r`n" +
'        </div>'
)

if ($n -notmatch 'const \[pickupDays, setPickupDays\]') {
    $n = $n.Replace(
'  const [pickup1, setPickup1] = useState("");' + "`r`n" +
'  const [pickup2, setPickup2] = useState("");' + "`r`n" +
'  const [pickup3, setPickup3] = useState("");',
'  const [pickupDays, setPickupDays] = useState<string[]>([]);' + "`r`n" +
'  const [pickupTimeBlocks, setPickupTimeBlocks] = useState<string[]>([]);' + "`r`n" +
'  const [pickupNotes, setPickupNotes] = useState("");'
    )
}

Write-Utf8NoBom -Path $newUi -Content $n
Write-Host "[OK] patched $newUi"

# ---------- 4) edit UI ----------
$editUi = Join-Path $repoRoot 'app\sell\edit\[id]\edit-listing-client.tsx'
$e = Get-Content -LiteralPath $editUi -Raw

$e = $e.Replace(
'  const seededPickup = Array.isArray((listing as any).pickupAvailability) ? (listing as any).pickupAvailability.map(function (x: any) { return String(x || ""); }) : ["", "", ""];',
'  const seededPickup = ((listing as any).pickupAvailability && typeof (listing as any).pickupAvailability === "object") ? (listing as any).pickupAvailability : { days: [], timeBlocks: [], notes: "" };'
)
$e = $e.Replace(
'    if (!pickup1.trim() || !pickup2.trim() || !pickup3.trim()) return "Please provide 3 pickup availability options.";',
'    if (!pickupDays.length || !pickupTimeBlocks.length) return "Please provide seller pickup availability.";'
)
$e = $e.Replace(
'                    pickupAvailability: [pickup1, pickup2, pickup3].map(function (v) { return String(v || "").trim(); }).filter(Boolean),',
'                    pickupAvailability: { days: pickupDays, timeBlocks: pickupTimeBlocks, notes: String(pickupNotes || "").trim() },'
)
$e = $e.Replace(
'            <input type="datetime-local" className="bd-input" value={pickup1} onChange={(e) => setPickup1(e.target.value)} />' + "`r`n" +
'            <input type="datetime-local" className="bd-input" value={pickup2} onChange={(e) => setPickup2(e.target.value)} />' + "`r`n" +
'            <input type="datetime-local" className="bd-input" value={pickup3} onChange={(e) => setPickup3(e.target.value)} />',
'            <div className="grid gap-3">' + "`r`n" +
'              <div>' + "`r`n" +
'                <div className="text-sm font-semibold bd-ink">Preferred pickup days</div>' + "`r`n" +
'                <div className="mt-2 flex flex-wrap gap-2">' + "`r`n" +
'                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(function (d) {' + "`r`n" +
'                    const active = pickupDays.includes(d);' + "`r`n" +
'                    return (' + "`r`n" +
'                      <button key={d} type="button" className={active ? "bd-btn bd-btn-primary" : "bd-btn bd-btn-ghost"} onClick={function () { setPickupDays(active ? pickupDays.filter(function (x) { return x !== d; }) : pickupDays.concat([d])); }}>' + "`r`n" +
'                        {d}' + "`r`n" +
'                      </button>' + "`r`n" +
'                    );' + "`r`n" +
'                  })}' + "`r`n" +
'                </div>' + "`r`n" +
'              </div>' + "`r`n" +
'              <div>' + "`r`n" +
'                <div className="text-sm font-semibold bd-ink">General pickup times</div>' + "`r`n" +
'                <div className="mt-2 flex flex-wrap gap-2">' + "`r`n" +
'                  {["Morning","Afternoon","Evening"].map(function (b) {' + "`r`n" +
'                    const active = pickupTimeBlocks.includes(b);' + "`r`n" +
'                    return (' + "`r`n" +
'                      <button key={b} type="button" className={active ? "bd-btn bd-btn-primary" : "bd-btn bd-btn-ghost"} onClick={function () { setPickupTimeBlocks(active ? pickupTimeBlocks.filter(function (x) { return x !== b; }) : pickupTimeBlocks.concat([b])); }}>' + "`r`n" +
'                        {b}' + "`r`n" +
'                      </button>' + "`r`n" +
'                    );' + "`r`n" +
'                  })}' + "`r`n" +
'                </div>' + "`r`n" +
'              </div>' + "`r`n" +
'              <div>' + "`r`n" +
'                <label className="text-sm font-semibold bd-ink">Pickup notes (optional)</label>' + "`r`n" +
'                <textarea className="bd-input mt-2 min-h-[88px]" value={pickupNotes} onChange={(e) => setPickupNotes(e.target.value)} placeholder="Example: Weeknights after work, Saturday mornings, flexible with notice." />' + "`r`n" +
'              </div>' + "`r`n" +
'            </div>'
)

$e = $e.Replace(
'  const [pickup1, setPickup1] = useState(seededPickup[0] || "");' + "`r`n" +
'  const [pickup2, setPickup2] = useState(seededPickup[1] || "");' + "`r`n" +
'  const [pickup3, setPickup3] = useState(seededPickup[2] || "");',
'  const [pickupDays, setPickupDays] = useState<string[]>(Array.isArray((seededPickup as any).days) ? (seededPickup as any).days : []);' + "`r`n" +
'  const [pickupTimeBlocks, setPickupTimeBlocks] = useState<string[]>(Array.isArray((seededPickup as any).timeBlocks) ? (seededPickup as any).timeBlocks : []);' + "`r`n" +
'  const [pickupNotes, setPickupNotes] = useState<string>(String((seededPickup as any).notes || ""));'
)

Write-Utf8NoBom -Path $editUi -Content $e
Write-Host "[OK] patched $editUi"
