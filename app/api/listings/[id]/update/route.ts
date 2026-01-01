import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const gate = await requireAdult(session);
    if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });

    const id = String(ctx?.params?.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
    }

    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "General").trim();
    const condition = String(body.condition || "Used").trim();
    const location = String(body.location || "").trim();
    const price = Number(body.price);
    const images = Array.isArray(body.images) ? body.images : [];

    if (title.length < 3) {
      return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });
    }
    if (images.length > 10) {
      return NextResponse.json({ error: "Too many images (max 10)." }, { status: 400 });
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: { title, description, category, condition, location, price, images },
    });

    return NextResponse.json({ listing });
  } catch (e: any) {
    console.error("Update listing error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
