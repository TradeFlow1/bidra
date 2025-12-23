import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as any;
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const formData = await req.formData();

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const type = String(formData.get("type") ?? "BUY_NOW").trim();
    const location = String(formData.get("location") ?? "").trim();
    const condition = String(formData.get("condition") ?? "Used - Good").trim();

    const priceDollars = Number(formData.get("price") ?? "0");
    const price = Math.max(0, Math.round(priceDollars * 100));

    if (!title || !description || !category || !type || !location || !condition || price <= 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let endsAt: Date | null = null;
    if (type === "AUCTION") {
      endsAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        category,
        type: type as any,
        status: "ACTIVE",
        condition,
        price,
        images: [],
        location,
        endsAt,
        sellerId: user.id,
      },
      select: { id: true },
    });

    return NextResponse.redirect(new URL(`/listing/${listing.id}`, req.url));
  } catch (err) {
    console.error("Create listing API error:", err);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
