import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0]?.trim();
  return ip || "unknown";
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : null;
  const ip = getClientIp(req);

  if (!rateLimit("contact:support:" + ip, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many support messages. Please wait a minute and try again." }, { status: 429 });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const email = String(body?.email ?? "").trim().slice(0, 200);
  const message = String(body?.message ?? "").trim().slice(0, 4000);
  const website = String(body?.website ?? "").trim().slice(0, 120);

  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!email) return NextResponse.json({ ok: false, error: "Missing email." }, { status: 400 });
  if (!message) return NextResponse.json({ ok: false, error: "Missing message." }, { status: 400 });

  if (email.indexOf("@") < 1 || email.indexOf(".") < 3) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }

  try {
    await prisma.adminEvent.create({
      data: {
        type: "CONTACT_MESSAGE",
        userId,
        data: {
          email,
          message,
          loggedOut: !userId,
          source: userId ? "signed-in-contact-form" : "logged-out-contact-form",
          ip,
          userAgent: req.headers.get("user-agent") || null,
          at: new Date().toISOString(),
        },
      },
    });
  } catch (e) {
    console.error("contact message create failed", e);
    return NextResponse.json({ ok: false, error: "Failed to send message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
