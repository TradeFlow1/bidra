import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED = new Set(["ACTIVE", "SUSPENDED"]);

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const listingId = String(form.get("listingId") || "");
  const status = String(form.get("status") || "");

  if (!listingId) return NextResponse.json({ ok: false, error: "Missing listingId" }, { status: 400 });
  if (!ALLOWED.has(status)) return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: status as any },
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
  });const backTo = String(form.get("backTo") || "");
  if (backTo) return NextResponse.redirect(new URL(backTo, req.url));

  return NextResponse.json({ ok: true });
}
