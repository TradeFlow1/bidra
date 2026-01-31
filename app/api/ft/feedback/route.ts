import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : undefined;

  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const gate = await requireAdult(session);
  const gateReason = gate?.reason ? String(gate.reason) : "";
  if (!gate?.ok) {
    const isPolicyBlock =
      gateReason.toUpperCase().includes("BLOCK") ||
      gateReason.toUpperCase().includes("RESTRICT") ||
      gateReason.toUpperCase().includes("POLICY");

    if (!isPolicyBlock) {
      return NextResponse.json({ error: `Not allowed: ${gateReason || "Restricted"}` }, { status: 403 });
    }
  }

  let body: any = null;
  try { body = await req.json(); } catch { body = null; }

  const message = String(body?.message ?? "").trim().slice(0, 2000);
  const pageUrl = String(body?.pageUrl ?? "").trim().slice(0, 500);

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  await prisma.adminEvent.create({
    data: {
      type: "FT_FEEDBACK",
      userId,
      data: {
        message,
        pageUrl: pageUrl || null,
        userAgent: req.headers.get("user-agent") || null,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
