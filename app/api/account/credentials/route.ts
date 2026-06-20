import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

function result(code: string, status = 400) {
  return NextResponse.json({ ok: code === "changed", code }, { status });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return result("unauthenticated", 401);
  }

  const form = await request.formData();
  const current = field(form, "current");
  const next = field(form, "next");
  const confirm = field(form, "confirm");

  if (!current || !next || !confirm) return result("missing");
  if (next.length < 8) return result("short");
  if (next !== confirm) return result("mismatch");
  if (next === current) return result("same");

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });

  if (!account?.passwordHash) return result("unavailable");

  const ok = await bcrypt.compare(current, account.passwordHash);
  if (!ok) return result("current");

  const passwordHash = await bcrypt.hash(next, 12);
  await prisma.user.update({
    where: { id: account.id },
    data: { passwordHash },
  });

  return result("changed", 200);
}
