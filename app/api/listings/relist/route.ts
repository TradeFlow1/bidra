import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingLooksProhibited } from "@/lib/prohibited-items";
import { applyPolicyStrike } from "@/lib/policy-strike";
import { requireAdult } from "@/lib/require-adult";

type RelistTxResult =
  | { ok: true; listingId: string; status: string }
  | { ok: false; status: number; error: string };

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, reason: gate.reason }, {
      status: gate.status,
      headers: { "content-type": "application/json" },
    });
  }

  const session = gate?.session;
  const userId = session?.user?.id ? String(session.user.id) : undefined;
  const role = session?.user?.role as string | undefined;
  const isAdmin = role === "ADMIN";

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await req.json().catch((): unknown => ({}));
  const listingId = String(body?.listingId ?? "");
  if (!listingId) {
    return NextResponse.json({ ok: false, error: "Missing listingId." }, {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const updated: RelistTxResult = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: { id: true, sellerId: true, status: true, title: true, description: true, category: true, images: true },
      });

      if (!listing) return { ok: false, status: 404 as const, error: "Listing not found." };
      if (!isAdmin && listing.sellerId !== userId)
        return { ok: false, status: 403 as const, error: "Not allowed." };

      // Relist is ONLY allowed on ENDED listings
      if (listing.status !== "ENDED")
        return { ok: false, status: 400 as const, error: "Relist is only available for ended listings." };

      // Hard block: if a listing has a completed order, it must never be relisted
      const completedOrder = await tx.order.findFirst({
        where: {
          listingId: listing.id,
          outcome: "COMPLETED",
        },
        select: { id: true },
      });

      if (completedOrder) {
        return { ok: false, status: 409 as const, error: "This listing has been completed and cannot be relisted." };
      }
      
      // Fix 13: prohibited items are blocked at relist (server-side)
      if (listingLooksProhibited({
        title: (listing as any)?.title,
        description: (listing as any)?.description,
        category: (listing as any)?.category,
        tags: null,
        images: (listing as any)?.images ?? null,
      })) {
        // Fix 13: prohibited escalation (log + rate-limit repeat attempts)
        try {
          const prevCount = await tx.adminEvent.count({
            where: { type: "PROHIBITED_LISTING_BLOCKED", userId },
          });

          await tx.adminEvent.create({
            data: {
              type: "PROHIBITED_LISTING_BLOCKED",
              userId,
              data: { listingId: listing.id, titleLen: String((listing as any)?.title ?? "").length, category: String((listing as any)?.category ?? "") },
            },
          });

          if (prevCount >= 2) {
            return { ok: false, status: 429 as const, error: "Too many prohibited listing attempts. Please review Bidra’s prohibited items policy or contact support." };
          }
        } catch (_e) {}


        const strike = await applyPolicyStrike(userId);
// audit (best-effort)
        try {
          await tx.adminEvent.create({
            data: {
              type: "LISTING_POLICY_BLOCKED_RELIST",
              userId,
              data: {
                strikes: strike.strikes,
                blockedUntil: strike.blockedUntil ? new Date(strike.blockedUntil).toISOString() : null,
                listingId: listing.id,
                title: (listing as any)?.title ?? "",
                category: (listing as any)?.category ?? "",
                at: new Date().toISOString(),
              },
            },
          });
        } catch (_e) {}
      
        return { ok: false, status: 400 as const, error: "This item is not permitted to be listed." };
      }
      

      const next = await tx.listing.update({
        where: { id: listingId },
        data: { status: "ACTIVE", previousStatus: listing.status },
        select: { id: true, status: true },
      });

      return { ok: true, listingId: next.id, status: next.status };
    });

    if (!updated.ok) {
      return NextResponse.json({ ok: false, error: updated.error }, {
        status: updated.status,
        headers: { "content-type": "application/json" },
      });
    }

    return NextResponse.json({ ok: true, listingId: updated.listingId }, {
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

