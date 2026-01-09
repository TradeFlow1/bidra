import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

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
