import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const FT_ENABLED = process.env.FT_ENABLED === "1";

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0]?.trim();
  return ip || "unknown";
}

export async function POST(req: Request) {
  if (!FT_ENABLED) {
    return new Response("Friend Test reporting disabled", { status: 404 });
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const ip = getClientIp(req);

  if (!rateLimit("report:ft:" + ip, 5, 60_000)) {
    return NextResponse.json({ error: "Too many reports. Please wait a minute and try again." }, { status: 429 });
  }

  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : undefined;

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
  const website = String(body?.website ?? "").trim().slice(0, 120);

  if (website) {
    return NextResponse.json({ ok: true });
  }

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
        ip,
        ua: req.headers.get("user-agent") || null,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
