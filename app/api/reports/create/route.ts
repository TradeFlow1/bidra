import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`reports:create:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await auth();
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { listingId, reason, details } = await req.json().catch(() => ({}));
  const id = String(listingId ?? "");
  const r = String(reason ?? "").trim();
  const d = String(details ?? "").trim();

  if (!id || !r) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  await prisma.report.create({
    data: { listingId: id, reporterId: user.id, reason: r, details: d || null }
  });

  return NextResponse.json({ ok: true });
}
