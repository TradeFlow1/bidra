import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));
  if (user.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));

  const form = await req.formData();
  const userId = String(form.get("userId") || "");
  const backTo = String(form.get("backTo") || "/admin/users");

  if (!userId) return NextResponse.redirect(new URL(backTo, req.url));

  await prisma.user.update({
    where: { id: userId },
    data: { policyBlockedUntil: null },
  });

  

  await prisma.adminActionLog.create({
    data: {
      adminId: user.id,
      action: "USER_UNBLOCK",
      entityType: "USER",
      entityId: userId,
      userId,
      meta: { note: "Block removed after trust-operations review." },
    },
  });

  return NextResponse.redirect(new URL(backTo, req.url));
}
