import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;

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

  return NextResponse.redirect(new URL(backTo, req.url));
}
