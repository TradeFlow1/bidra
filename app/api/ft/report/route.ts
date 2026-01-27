import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const FT_ENABLED = process.env.FT_ENABLED === "1";

export async function POST(req: Request) {
  if (!FT_ENABLED) {
    return new Response("Friend Test reporting disabled", { status: 404 });
  }

  // FT routes must never run in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const title = String(body?.title ?? "").trim().slice(0, 200);
  const message = String(body?.message ?? "").trim().slice(0, 4000);
  const email = String(body?.email ?? "").trim().slice(0, 320);
  const url = String(body?.url ?? "").trim().slice(0, 1000);
  const source = String(body?.source ?? "FT-02").trim().slice(0, 64);

  if (!title || !message) {
    return NextResponse.json({ error: "Missing title or message." }, { status: 400 });
  }

  await prisma.adminEvent.create({
    data: {
      type: "FT_BUG_REPORTED",
      userId: userId || null,
      data: {
        source,
        title,
        message,
        email: email || null,
        url: url || null,
        ua: req.headers.get("user-agent") || null,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
