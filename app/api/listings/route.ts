import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        NOT: [
          { title: { equals: "test", mode: "insensitive" } },
          { title: { startsWith: "test", mode: "insensitive" } },
          { title: { contains: "dfgh", mode: "insensitive" } },
          { title: { contains: "asdf", mode: "insensitive" } },
          { title: { contains: "qwer", mode: "insensitive" } },
          { title: { contains: "no photos", mode: "insensitive" } },
          { title: { contains: "no photo", mode: "insensitive" } }
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        type: true,
        images: true,
        price: true,
        buyNowPrice: true,
        category: true,
        condition: true,
        createdAt: true,
      },
      take: 24,
    });

    return NextResponse.json({ listings });
  } catch (err) {
    console.error("GET /api/listings failed", err);
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 });
  }
}
