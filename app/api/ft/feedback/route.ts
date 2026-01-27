import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const FT_ENABLED = process.env.FT_ENABLED === "1";


export async function POST(req: Request) {
  if (!FT_ENABLED) {
    return new Response("Friend Test feedback disabled", { status: 404 });
  }


  // FT routes must never run in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  // If logged in, enforce 18+ (anonymous FT feedback stays allowed)
  if (userId) {
    const gate = await requireAdult(session as any);
    if (!gate.ok) return NextResponse.json({ ok: false, reason: gate.reason || "ADULT_REQUIRED" }, { status: 403 });
  }


  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const message = String(body?.message ?? "").trim().slice(0, 4000);
  const email = String(body?.email ?? "").trim().slice(0, 320);
  const source = String(body?.source ?? "FT").trim().slice(0, 64);

  if (!message) {
    return NextResponse.json({ error: "Missing message." }, { status: 400 });
  }

  // Store as an admin-visible event (no new tables needed)
  await prisma.adminEvent.create({
    data: {
      type: "FT_FEEDBACK_SUBMITTED",
      userId: userId || null,
      data: {
        source,
        email: email || null,
        message,
        ua: req.headers.get("user-agent") || null,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
