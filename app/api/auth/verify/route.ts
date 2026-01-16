import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = String(url.searchParams.get("token") ?? "").trim();
    if (!token) return NextResponse.redirect(new URL("/auth/login?verify=missing", url));

    const vt = await prisma.verificationToken.findUnique({
      where: { token },
      select: { token: true, expiresAt: true, userId: true },
    });

    if (!vt || !vt.expiresAt || vt.expiresAt.getTime() < Date.now()) {
      return NextResponse.redirect(new URL("/auth/login?verify=expired", url));
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: vt.userId },
        data: { emailVerified: true, isActive: true },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);

    return NextResponse.redirect(new URL("/auth/login?verify=ok", url));
  } catch (e) {
    console.error("VERIFY_EMAIL_ERR", e);
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/auth/login?verify=error", url));
  }
}
