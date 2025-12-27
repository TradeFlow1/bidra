import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;

  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const id = String(form.get("id") || "");
  const resolvedRaw = String(form.get("resolved") || "");
  const resolved = resolvedRaw === "true";

  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  await prisma.report.update({
    where: { id },
    data: { resolved },
  });

  return NextResponse.redirect(new URL("/admin/reports/" + id, req.url));
}