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
  const backTo = String(form.get("backTo") || "/admin/listings");

  if (!listingId) return NextResponse.redirect(new URL(backTo, req.url));

  // If you prefer restoring to ENDED or COMPLETED based on offer-window end state later, we can improve this.
  // For now, unsuspend returns listing to ACTIVE.
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "ACTIVE" },
  });

  

  await prisma.adminActionLog.create({
    data: {
      adminId: user.id,
      action: "LISTING_UNSUSPEND",
      entityType: "LISTING",
      entityId: listingId,
      listingId,
meta: { toStatus: "ACTIVE" },
    },
  });return NextResponse.redirect(new URL(backTo, req.url));
}
