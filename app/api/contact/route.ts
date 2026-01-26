import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const email = String(body?.email ?? "").trim().slice(0, 200);
  const message = String(body?.message ?? "").trim().slice(0, 4000);

  if (!email) return NextResponse.json({ ok: false, error: "Missing email." }, { status: 400 });
  if (!message) return NextResponse.json({ ok: false, error: "Missing message." }, { status: 400 });

  // Basic email sanity (not strict)
  if (email.indexOf("@") < 1 || email.indexOf(".") < 3) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }

  try {
    await prisma.adminEvent.create({
      data: {
        type: "CONTACT_MESSAGE",
        userId: session.user.id ?? null,
        data: {
          email,
          message,
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
