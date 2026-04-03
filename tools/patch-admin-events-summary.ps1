#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath '.\package.json')) { throw "Not at repo root: $(Get-Location)" }

$path = 'app\admin\events\page.tsx'
if (-not (Test-Path -LiteralPath $path)) { throw "Missing file: $path" }

$content = Get-Content -LiteralPath $path -Raw

$old = @'
          <thead>
            <tr className="bg-white/60 border-b bd-bd text-left">
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="When the event was recorded">Time</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Event type">Type</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="User id involved">User</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Order id if relevant">Order</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Event payload / details">Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t bd-bd hover:bg-neutral-50">
                <td className="px-4 py-3 bd-ink2 text-xs whitespace-nowrap"><DateTimeText value={r.createdAt} /></td>
                <td className="px-4 py-3 bd-ink text-xs font-extrabold whitespace-nowrap">{r.type}</td>
                <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{r.userId || "-"}</td>
                <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{r.orderId || "-"}</td>
                <td className="px-4 py-3 bd-ink2 text-xs">
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.data ? JSON.stringify(r.data, null, 2) : "-"}</pre>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 12, opacity: 0.7 }}>No events yet.</td>
              </tr>
            ) : null}
          </tbody>
'@

$new = @'
          <thead>
            <tr className="bg-white/60 border-b bd-bd text-left">
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="When the event was recorded">Time</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Event type">Type</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="User id involved">User</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Order id if relevant">Order</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Readable event summary">Summary</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold bd-ink" title="Event payload / details">Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : null;
              const requestedByRole = d && typeof d["requestedByRole"] === "string" ? String(d["requestedByRole"]) : null;
              const reportedByRole = d && typeof d["reportedByRole"] === "string" ? String(d["reportedByRole"]) : null;
              const actorRole = requestedByRole || reportedByRole || null;
              const currentScheduledAt = d && d["currentScheduledAt"] ? String(d["currentScheduledAt"]) : null;
              const scheduledAt = d && d["scheduledAt"] ? String(d["scheduledAt"]) : null;
              const whenText = currentScheduledAt || scheduledAt || null;
              const reasonText = d && typeof d["reason"] === "string" ? String(d["reason"]) : null;

              return (
                <tr key={r.id} className="border-t bd-bd hover:bg-neutral-50">
                  <td className="px-4 py-3 bd-ink2 text-xs whitespace-nowrap"><DateTimeText value={r.createdAt} /></td>
                  <td className="px-4 py-3 bd-ink text-xs font-extrabold whitespace-nowrap">{r.type}</td>
                  <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{r.userId || "-"}</td>
                  <td style={{ padding: 10, fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                    {r.orderId ? <Link href={"/orders/" + r.orderId} style={{ textDecoration: "underline" }}>{r.orderId}</Link> : "-"}
                  </td>
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    <div className="grid gap-1">
                      <div><span className="font-extrabold bd-ink">Role:</span> {actorRole || "-"}</div>
                      <div><span className="font-extrabold bd-ink">When:</span> {whenText || "-"}</div>
                      <div><span className="font-extrabold bd-ink">Reason:</span> {reasonText || "-"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.data ? JSON.stringify(r.data, null, 2) : "-"}</pre>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 12, opacity: 0.7 }}>No events yet.</td>
              </tr>
            ) : null}
          </tbody>
'@

if (-not $content.Contains($old)) { throw 'Expected table block not found exactly. Aborting without changes.' }

$updated = $content.Replace($old, $new)
if ($updated -eq $content) { throw 'Replacement produced no change.' }

[System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $path), $updated, (New-Object System.Text.UTF8Encoding($false)))
Write-Host '[OK] patched app\admin\events\page.tsx'
