#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath '.\package.json')) { throw "Not at repo root: $(Get-Location)" }

$targets = @(
  @{
    Path = 'app\api\admin\orders\reschedule-request\resolve\route.ts';
    Marker = '  if (order.status !== OrderStatus.PICKUP_SCHEDULED) return NextResponse.redirect(new URL(backTo, req.url));';
    Insert = @(
      ' ',
      '  const existingReview = await prisma.adminEvent.findFirst({',
      '    where: {',
      '      orderId: order.id,',
      '      type: { in: ["ORDER_RESCHEDULE_REQUEST_APPROVED", "ORDER_RESCHEDULE_REQUEST_REJECTED"] },',
      '    },',
      '    select: { id: true },',
      '  });',
      '  if (existingReview) return NextResponse.redirect(new URL(backTo, req.url));'
    )
  },
  @{
    Path = 'app\api\admin\orders\no-show-report\resolve\route.ts';
    Marker = '  if (!order) return NextResponse.redirect(new URL(backTo, req.url));';
    Insert = @(
      ' ',
      '  const existingReview = await prisma.adminEvent.findFirst({',
      '    where: {',
      '      orderId: order.id,',
      '      type: "ORDER_NO_SHOW_REPORT_REVIEWED"',
      '    },',
      '    select: { id: true },',
      '  });',
      '  if (existingReview) return NextResponse.redirect(new URL(backTo, req.url));'
    )
  }
)

foreach ($t in $targets) {
  $path = $t.Path
  if (-not (Test-Path -LiteralPath $path)) { throw "Missing file: $path" }

  $content = Get-Content -LiteralPath $path -Raw
  if ($content.Contains('const existingReview = await prisma.adminEvent.findFirst(')) {
    Write-Host "[SKIP] guard already present in $path"
    continue
  }

  $marker = $t.Marker
  if (-not $content.Contains($marker)) { throw "Marker not found in $path" }

  $insertText = [string]::Join("`r`n", $t.Insert)
  $replacement = $marker + "`r`n" + $insertText
  $updated = $content.Replace($marker, $replacement)

  if ($updated -eq $content) { throw "No change produced for $path" }

  [System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $path), $updated, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "[OK] patched $path"
}
