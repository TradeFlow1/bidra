import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("activity ping failed", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
