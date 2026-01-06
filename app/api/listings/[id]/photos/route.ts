import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

function cleanUrl(input: any) {
  const s = String(input ?? "").trim();
  if (!s) return "";
  if (s.length > 500) return "";
  if (!/^https?:\/\//i.test(s)) return "";
  return s;
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const gate = await requireAdult(session);
    if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });

    const id = String(ctx?.params?.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing listing id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const url = cleanUrl(body?.url);
    if (!url) return NextResponse.json({ error: "Invalid url" }, { status: 400 });

    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, sellerId: true, status: true, images: true },
    });

    if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (existing.sellerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const imgs = Array.isArray(existing.images) ? existing.images : [];
    const next = imgs.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);

    if (next.includes(url)) {
      return NextResponse.json({ ok: true, images: next });
    }

    if (next.length >= 10) {
      return NextResponse.json({ error: "Too many images (max 10)." }, { status: 400 });
    }

    next.unshift(url);

    const updated = await prisma.listing.update({
      where: { id },
      data: { images: next },
      select: { id: true, images: true },
    });

    return NextResponse.json({ ok: true, listing: updated });
  } catch (e: any) {
    console.error("Add photo error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const gate = await requireAdult(session);
    if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });

    const id = String(ctx?.params?.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing listing id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const url = cleanUrl(body?.url);
    if (!url) return NextResponse.json({ error: "Invalid url" }, { status: 400 });

    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, sellerId: true, images: true },
    });

    if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (existing.sellerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const imgs = Array.isArray(existing.images) ? existing.images : [];
    const next = imgs
      .filter(Boolean)
      .map((x) => String(x).trim())
      .filter((x) => x && x !== url);

    const updated = await prisma.listing.update({
      where: { id },
      data: { images: next },
      select: { id: true, images: true },
    });

    return NextResponse.json({ ok: true, listing: updated });
  } catch (e: any) {
    console.error("Remove photo error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
