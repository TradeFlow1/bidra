import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const user: any = session?.user;

  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));
  if (user.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));

  const form = await req.formData();
  const listingId = String(form.get("listingId") || "");
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
meta: { toStatus: "DELETED" },
    },
  });await prisma.report.updateMany({
    where: { listingId, resolved: false },
    data: { resolved: true },
  });

  return NextResponse.redirect(new URL(backTo, req.url));
}
