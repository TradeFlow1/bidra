import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ListingStatus } from "@prisma/client";

const ALLOWED = ["ACTIVE", "SUSPENDED"] as const;

type AllowedStatus = typeof ALLOWED[number];
const isAllowedStatus = (v: string): v is AllowedStatus => (ALLOWED as readonly string[]).includes(v);

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const listingId = String(form.get("listingId") || "");
  const status = String(form.get("status") || "");

  if (!listingId) return NextResponse.json({ ok: false, error: "Missing listingId" }, { status: 400 });
  if (!isAllowedStatus(status)) return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });

  const nextStatus: ListingStatus = status;

// V2 enforcement lock: SOLD/COMPLETE transitions must only be created by the enforcement routes
// (Buy Now + Accept Offer). Admin tools may suspend/delete/restore, but must not bypass.
const statusUpper = String(status || "").toUpperCase();
if (statusUpper === "SOLD" || statusUpper === "COMPLETE" || statusUpper === "COMPLETED") {
  return NextResponse.json({ ok: false, error: "Forbidden status transition" }, { status: 403 });
}

await prisma.listing.update({
    where: { id: listingId },
    data: { status: nextStatus },
  });

  

  await prisma.adminActionLog.create({
    data: {
      adminId: user.id,
      action: "LISTING_SET_STATUS",
      entityType: "LISTING",
      entityId: listingId,
      listingId,
      meta: { toStatus: status || null },
    },
  });

  const backTo = String(form.get("backTo") || "");
  if (backTo) return NextResponse.redirect(new URL(backTo, req.url));

  return NextResponse.json({ ok: true });
}
