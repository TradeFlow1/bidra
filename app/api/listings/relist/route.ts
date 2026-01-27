import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, reason: gate.reason }, {
      status: gate.status,
      headers: { "content-type": "application/json" },
    });
  }

  const session = gate?.session;
  const userId = session?.user?.id as string | undefined;
  const role = session?.user?.role as string | undefined;
  const isAdmin = role === "ADMIN";

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({} as any));
  const listingId = String(body?.listingId ?? "");
  if (!listingId) {
    return NextResponse.json({ ok: false, error: "Missing listingId." }, {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: { id: true, sellerId: true, status: true },
      });

      if (!listing) return { ok: false, status: 404 as const, error: "Listing not found." };
      if (!isAdmin && listing.sellerId !== userId)
        return { ok: false, status: 403 as const, error: "Not allowed." };

      // Relist is ONLY allowed on ENDED listings
      if (listing.status !== "ENDED")
        return { ok: false, status: 400 as const, error: "Relist is only available for ended listings." };

      // Hard block: if a listing has a PAID or COMPLETED order, it must never be relisted
      const paidOrCompleted = await tx.order.findFirst({
        where: {
          listingId: listing.id,
          OR: [{ status: "PAID" }, { outcome: "COMPLETED" }],
        },
        select: { id: true },
      });

      if (paidOrCompleted) {
        return { ok: false, status: 409 as const, error: "This listing has been paid for and cannot be relisted." };
      }

      const next = await tx.listing.update({
        where: { id: listingId },
        data: { status: "ACTIVE", previousStatus: listing.status },
        select: { id: true, status: true },
      });

      return { ok: true, listingId: next.id, status: next.status };
    });

    if (!(updated as any).ok) {
      return NextResponse.json({ ok: false, error: (updated as any).error }, {
        status: (updated as any).status ?? 400,
        headers: { "content-type": "application/json" },
      });
    }

    return NextResponse.json({ ok: true, listingId: (updated as any).listingId }, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Relist failed." }, {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
