import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { requireAdult } from "@/lib/require-adult";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const displayName =
      typeof body.displayName === "string" ? body.displayName.trim().slice(0, 40) : undefined;
      typeof body.bio === "string" ? body.bio.trim().slice(0, 280) : undefined;
      typeof body.suburb === "string" ? body.suburb.trim().slice(0, 60) : undefined;
      typeof body.state === "string" ? body.state.trim().slice(0, 30) : undefined;
      typeof body.postcode === "string" ? body.postcode.trim().slice(0, 10) : undefined;

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: displayName,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Profile update failed" },
      { status: 500 }
    );
  }
}
