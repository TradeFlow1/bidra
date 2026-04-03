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

$old1 = @'
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/admin/events" style={chipStyle(!type)}>All events</Link>
        <Link href="/admin/events?type=ORDER_PICKUP_SCHEDULED" style={chipStyle(type === "ORDER_PICKUP_SCHEDULED")}>Pickup scheduled</Link>
        <Link href="/admin/events?type=ORDER_RESCHEDULE_REQUESTED" style={chipStyle(type === "ORDER_RESCHEDULE_REQUESTED")}>Reschedule requested</Link>
        <Link href="/admin/events?type=ORDER_NO_SHOW_REPORTED" style={chipStyle(type === "ORDER_NO_SHOW_REPORTED")}>No-show reported</Link>
      </div>
'@

$new1 = @'
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/admin/events" style={chipStyle(!type)}>All events</Link>
        <Link href="/admin/events?type=ORDER_PICKUP_SCHEDULED" style={chipStyle(type === "ORDER_PICKUP_SCHEDULED")}>Pickup scheduled</Link>
        <Link href="/admin/events?type=ORDER_RESCHEDULE_REQUESTED" style={chipStyle(type === "ORDER_RESCHEDULE_REQUESTED")}>Reschedule requested</Link>
        <Link href="/admin/events?type=ORDER_RESCHEDULE_REQUEST_APPROVED" style={chipStyle(type === "ORDER_RESCHEDULE_REQUEST_APPROVED")}>Reschedule approved</Link>
        <Link href="/admin/events?type=ORDER_RESCHEDULE_REQUEST_REJECTED" style={chipStyle(type === "ORDER_RESCHEDULE_REQUEST_REJECTED")}>Reschedule rejected</Link>
        <Link href="/admin/events?type=ORDER_NO_SHOW_REPORTED" style={chipStyle(type === "ORDER_NO_SHOW_REPORTED")}>No-show reported</Link>
        <Link href="/admin/events?type=ORDER_NO_SHOW_REPORT_REVIEWED" style={chipStyle(type === "ORDER_NO_SHOW_REPORT_REVIEWED")}>No-show reviewed</Link>
      </div>
'@

$old2 = @'
              const d = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : null;
              const requestedByRole = d && typeof d["requestedByRole"] === "string" ? String(d["requestedByRole"]) : null;
              const reportedByRole = d && typeof d["reportedByRole"] === "string" ? String(d["reportedByRole"]) : null;
              const actorRole = requestedByRole || reportedByRole || null;
              const currentScheduledAt = d && d["currentScheduledAt"] ? String(d["currentScheduledAt"]) : null;
              const scheduledAt = d && d["scheduledAt"] ? String(d["scheduledAt"]) : null;
              const whenText = currentScheduledAt || scheduledAt || null;
              const reasonText = d && typeof d["reason"] === "string" ? String(d["reason"]) : null;

              const backTo = "/admin/events?type=" + encodeURIComponent(type || r.type);
              const isRescheduleRequest = r.type === "ORDER_RESCHEDULE_REQUESTED";
              const isNoShowReport = r.type === "ORDER_NO_SHOW_REPORTED";
'@

$new2 = @'
              const d = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : null;
              const requestedByRole = d && typeof d["requestedByRole"] === "string" ? String(d["requestedByRole"]) : null;
              const reportedByRole = d && typeof d["reportedByRole"] === "string" ? String(d["reportedByRole"]) : null;
              const actorRole = requestedByRole || reportedByRole || null;
              const currentScheduledAt = d && d["currentScheduledAt"] ? String(d["currentScheduledAt"]) : null;
              const scheduledAt = d && d["scheduledAt"] ? String(d["scheduledAt"]) : null;
              const whenText = currentScheduledAt || scheduledAt || null;
              const reasonText = d && typeof d["reason"] === "string" ? String(d["reason"]) : null;
              const decisionText = d && typeof d["decision"] === "string" ? String(d["decision"]) : null;
              const noteText = d && typeof d["note"] === "string" ? String(d["note"]) : null;

              const backTo = "/admin/events?type=" + encodeURIComponent(type || r.type);
              const isRescheduleRequest = r.type === "ORDER_RESCHEDULE_REQUESTED";
              const isRescheduleReviewed = r.type === "ORDER_RESCHEDULE_REQUEST_APPROVED" || r.type === "ORDER_RESCHEDULE_REQUEST_REJECTED";
              const isNoShowReport = r.type === "ORDER_NO_SHOW_REPORTED";
              const isNoShowReviewed = r.type === "ORDER_NO_SHOW_REPORT_REVIEWED";
'@

$old3 = @'
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    <div className="grid gap-1">
                      <div><span className="font-extrabold bd-ink">Role:</span> {actorRole || "-"}</div>
                      <div><span className="font-extrabold bd-ink">When:</span> {whenText || "-"}</div>
                      <div><span className="font-extrabold bd-ink">Reason:</span> {reasonText || "-"}</div>
                    </div>
                  </td>
'@

$new3 = @'
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    <div className="grid gap-1">
                      <div><span className="font-extrabold bd-ink">Role:</span> {actorRole || "-"}</div>
                      <div><span className="font-extrabold bd-ink">When:</span> {whenText || "-"}</div>
                      <div><span className="font-extrabold bd-ink">Reason:</span> {reasonText || "-"}</div>
                      {(isRescheduleReviewed || isNoShowReviewed) ? <div><span className="font-extrabold bd-ink">Decision:</span> {decisionText || "-"}</div> : null}
                      {(isRescheduleReviewed || isNoShowReviewed) ? <div><span className="font-extrabold bd-ink">Note:</span> {noteText || "-"}</div> : null}
                    </div>
                  </td>
'@

$old4 = @'
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    {isRescheduleRequest && r.orderId ? (
                      <div className="grid gap-2">
                        <form action="/api/admin/orders/reschedule-request/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="APPROVE" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="scheduledAt" type="datetime-local" className="bd-input" />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-primary">Approve + reschedule</button>
                        </form>
                        <form action="/api/admin/orders/reschedule-request/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REJECT" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-ghost">Reject request</button>
                        </form>
                      </div>
                    ) : null}

                    {isNoShowReport && r.orderId ? (
                      <div className="grid gap-2">
                        <form action="/api/admin/orders/no-show-report/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REVIEWED_BUYER_AT_FAULT" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-primary">Buyer at fault</button>
                        </form>
                        <form action="/api/admin/orders/no-show-report/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REVIEWED_SELLER_AT_FAULT" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-primary">Seller at fault</button>
                        </form>
                        <form action="/api/admin/orders/no-show-report/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REVIEWED_INCONCLUSIVE" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-ghost">Inconclusive</button>
                        </form>
                      </div>
                    ) : null}
                  </td>
'@

$new4 = @'
                  <td className="px-4 py-3 bd-ink2 text-xs">
                    {isRescheduleRequest && r.orderId ? (
                      <div className="grid gap-2">
                        <form action="/api/admin/orders/reschedule-request/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="APPROVE" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="scheduledAt" type="datetime-local" className="bd-input" />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-primary">Approve + reschedule</button>
                        </form>
                        <form action="/api/admin/orders/reschedule-request/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REJECT" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-ghost">Reject request</button>
                        </form>
                      </div>
                    ) : isRescheduleReviewed ? (
                      <div className="font-semibold bd-ink">Reviewed</div>
                    ) : null}

                    {isNoShowReport && r.orderId ? (
                      <div className="grid gap-2">
                        <form action="/api/admin/orders/no-show-report/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REVIEWED_BUYER_AT_FAULT" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-primary">Buyer at fault</button>
                        </form>
                        <form action="/api/admin/orders/no-show-report/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REVIEWED_SELLER_AT_FAULT" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-primary">Seller at fault</button>
                        </form>
                        <form action="/api/admin/orders/no-show-report/resolve" method="post" className="grid gap-2">
                          <input type="hidden" name="orderId" value={r.orderId} />
                          <input type="hidden" name="decision" value="REVIEWED_INCONCLUSIVE" />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input name="note" placeholder="Admin note (optional)" className="bd-input" />
                          <button type="submit" className="bd-btn bd-btn-ghost">Inconclusive</button>
                        </form>
                      </div>
                    ) : isNoShowReviewed ? (
                      <div className="font-semibold bd-ink">Reviewed</div>
                    ) : null}
                  </td>
'@

if (-not $content.Contains($old1)) { throw 'Expected chip block not found exactly.' }
if (-not $content.Contains($old2)) { throw 'Expected row state block not found exactly.' }
if (-not $content.Contains($old3)) { throw 'Expected summary block not found exactly.' }
if (-not $content.Contains($old4)) { throw 'Expected actions block not found exactly.' }

$updated = $content.Replace($old1, $new1)
$updated = $updated.Replace($old2, $new2)
$updated = $updated.Replace($old3, $new3)
$updated = $updated.Replace($old4, $new4)

if ($updated -eq $content) { throw 'Replacement produced no change.' }

[System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $path), $updated, (New-Object System.Text.UTF8Encoding($false)))
Write-Host '[OK] patched app\admin\events\page.tsx'
