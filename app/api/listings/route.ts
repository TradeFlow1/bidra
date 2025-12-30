import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        buyNowPrice: true,
        category: true,
        condition: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ listings });
  } catch (err) {
    console.error("GET /api/listings failed", err);
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 });
  }
}
