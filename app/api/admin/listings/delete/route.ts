import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));
  if (user.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));

  const form = await req.formData();
  const listingId = String(form.get("listingId") || "");
    const reason = String(form.get("reason") || "").trim();
const backTo = String(form.get("backTo") || "/admin/reports");

  if (!listingId) return NextResponse.redirect(new URL(backTo, req.url));

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "DELETED" },
  });

  

  await prisma.adminActionLog.create({
    data: {
      adminId: user.id,
      action: "LISTING_DELETE",
      entityType: "LISTING",
      entityId: listingId,
      listingId,
      meta: { toStatus: "DELETED", reason: reason || null, note: reason || "Listing removed from public view after trust-operations review." },
    },
  });

  await prisma.report.updateMany({
    where: { listingId, resolved: false },
    data: { resolved: true },
  });

  return NextResponse.redirect(new URL(backTo, req.url));
}
