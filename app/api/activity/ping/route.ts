import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PingBody = {
  sessionId: string;
  path?: string;
  referrer?: string;
  userAgent?: string;
  activeMsDelta?: number;
  idleMsDelta?: number;
};

function clampInt(n: unknown, min: number, max: number) {
  const x = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : 0;
  return Math.max(min, Math.min(max, x));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PingBody;

    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    if (!sessionId || sessionId.length < 8 || sessionId.length > 128) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const path = typeof body.path === "string" ? body.path.slice(0, 300) : null;
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
    const userAgent = typeof body.userAgent === "string" ? body.userAgent.slice(0, 500) : null;

    const activeMsDelta = clampInt(body.activeMsDelta, 0, 120000);
    const idleMsDelta = clampInt(body.idleMsDelta, 0, 120000);

    const now = new Date();

    await prisma.activitySession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        userId: null,
        startedAt: now,
        lastSeenAt: now,
        totalActiveMs: activeMsDelta,
        totalIdleMs: idleMsDelta,
        lastPath: path,
        lastReferrer: referrer,
        userAgent,
      },
      update: {
        lastSeenAt: now,
        totalActiveMs: { increment: activeMsDelta },
        totalIdleMs: { increment: idleMsDelta },
        lastPath: path ?? undefined,
        lastReferrer: referrer ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("activity ping failed", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
