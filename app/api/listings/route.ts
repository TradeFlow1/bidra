import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const take = Math.min(parseInt(searchParams.get("take") || "50", 10) || 50, 100);
    const skip = Math.max(parseInt(searchParams.get("skip") || "0", 10) || 0, 0);

    // Optional filters
    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim();

    const where: any = {
      status: "ACTIVE",
    };

    if (category) where.category = category;

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        title: true,
        price: true,
        currentBid: true,
        buyNowPrice: true,
        category: true,
        condition: true,
        suburb: true,
        state: true,
        createdAt: true,
        endsAt: true,
        imageUrl: true,
        sellerId: true,
        status: true,
      },
    });

    return NextResponse.json({ ok: true, items, take, skip });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
