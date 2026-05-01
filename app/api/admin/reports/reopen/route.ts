import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export async function POST(req: Request) {
  const session = await auth();

  const gate = await requireAdult(session);
  if (!gate.ok) return NextResponse.redirect(new URL("/account/restrictions", req.url));
  const user = session?.user;

  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));
  if (user.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));

  const form = await req.formData();
  const reportId = String(form.get("reportId") || "");
  const backTo = String(form.get("backTo") || "/admin/reports");

  if (!reportId) return NextResponse.redirect(new URL("/admin/reports", req.url));

  await prisma.report.update({
    where: { id: reportId },
    data: { resolved: false },
  });

  await prisma.adminActionLog.create({
    data: {
      adminId: user.id,
      action: "REPORT_REOPEN_FOR_FRESH_EVIDENCE",
      entityType: "REPORT",
      entityId: reportId,
      reportId,
    },
  });

  return NextResponse.redirect(new URL(backTo, req.url));
}
