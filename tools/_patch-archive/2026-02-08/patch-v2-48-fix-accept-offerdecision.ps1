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
  $bak = "$File.bak_v2_48_accept_offerdecision"
  if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$target = '.\app\api\listings\[id]\accept-highest-offer\route.ts'
if (-not (Test-Path -LiteralPath $target)) { throw "Missing: $target" }
Backup-File -File $target

$out = @(
  'import { NextResponse } from "next/server";',
  'import { prisma } from "@/lib/prisma";',
  'import { auth } from "@/lib/auth";',
  '',
  'export async function POST(',
  '  _req: Request,',
  '  { params }: { params: { id: string } }',
  ') {',
  '  try {',
  '    const session = await auth();',
  '    const me = session?.user;',
  '',
  '    if (!me || !me.id) {',
  '      return NextResponse.json({ ok: false }, { status: 401 });',
  '    }',
  '',
  '    const listingId = params.id;',
  '',
  '    const listing = await prisma.listing.findUnique({',
  '      where: { id: listingId },',
  '      include: {',
  '        offers: {',
  '          orderBy: { amount: "desc" },',
  '          take: 1,',
  '        },',
  '      },',
  '    });',
  '',
  '    if (!listing) {',
  '      return NextResponse.json({ ok: false }, { status: 404 });',
  '    }',
  '',
  '    if (listing.sellerId !== me.id) {',
  '      return NextResponse.json({ ok: false }, { status: 403 });',
  '    }',
  '',
  '    // Buy Now parity: only ACTIVE listings can convert to SOLD',
  '    if (listing.status !== "ACTIVE") {',
  '      return NextResponse.json({ ok: false }, { status: 409 });',
  '    }',
  '',
  '    const offer = listing.offers[0];',
  '    if (!offer) {',
  '      return NextResponse.json({ ok: false }, { status: 400 });',
  '    }',
  '',
  '    // Race-safe SOLD transition',
  '    const updated = await prisma.listing.updateMany({',
  '      where: { id: listingId, status: "ACTIVE" },',
  '      data: { status: "SOLD" },',
  '    });',
  '',
  '    if (updated.count !== 1) {',
  '      return NextResponse.json({ ok: false }, { status: 409 });',
  '    }',
  '',
  '    // Record seller acceptance via OfferDecision (not on the Offer row)',
  '    await prisma.offerDecision.upsert({',
  '      where: { listingId_offerId: { listingId, offerId: offer.id } },',
  '      create: {',
  '        listingId,',
  '        offerId: offer.id,',
  '        sellerId: me.id,',
  '        buyerId: offer.bidderId,',
  '        decision: "ACCEPTED",',
  '      },',
  '      update: {',
  '        decision: "ACCEPTED",',
  '        sellerId: me.id,',
  '        buyerId: offer.bidderId,',
  '      },',
  '    });',
  '',
  '    return NextResponse.json({',
  '      ok: true,',
  '      outcome: "PENDING",',
  '      type: "OFFER_ACCEPTED",',
  '    });',
  '  } catch (e) {',
  '    console.error("Accept highest offer error:", e);',
  '    return NextResponse.json({ ok: false }, { status: 500 });',
  '  }',
  '}',
  ''
)

Set-Content -LiteralPath $target -Value $out -Encoding UTF8
Write-Host 'Patched accept-highest-offer to use OfferDecision (no acceptedAt).'

