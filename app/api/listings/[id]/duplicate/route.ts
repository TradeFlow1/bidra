import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";

export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function POST(_req: Request, { params }: RouteParams) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, reason: gate.reason }, { status: gate.status });
  }

  const userId = gate.session?.user?.id ? String(gate.session.user.id) : "";
  const role = String(gate.session?.user?.role || "");
  const isAdmin = role === "ADMIN";

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const sourceId = String(params.id || "").trim();
  if (!sourceId) {
    return NextResponse.json({ ok: false, error: "Missing listing id." }, { status: 400 });
  }

  try {
    const source = await prisma.listing.findUnique({
      where: { id: sourceId },
      select: {
        id: true,
        sellerId: true,
        title: true,
        description: true,
        category: true,
        type: true,
        condition: true,
        price: true,
        buyNowPrice: true,
        buyNowEnabled: true,
        images: true,
        photos: true,
        location: true,
        locationState: true,
        locationSuburb: true,
        locationPostcode: true,
        latitude: true,
        longitude: true,
        fulfillmentType: true,
        attributes: true,
        offerIncrement: true,
      },
    });

    if (!source) {
      return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
    }

    if (!isAdmin && source.sellerId !== userId) {
      return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
    }

    const copy = await prisma.listing.create({
      data: {
        sellerId: source.sellerId,
        title: `Copy of ${source.title}`.slice(0, 120),
        description: source.description,
        category: source.category,
        type: source.type,
        status: "DRAFT",
        condition: source.condition,
        price: source.price,
        buyNowPrice: source.buyNowPrice,
        buyNowEnabled: source.buyNowEnabled,
        images: source.images || [],
        photos: source.photos || [],
        location: source.location,
        locationState: source.locationState,
        locationSuburb: source.locationSuburb,
        locationPostcode: source.locationPostcode,
        latitude: source.latitude,
        longitude: source.longitude,
        fulfillmentType: source.fulfillmentType,
        attributes: source.attributes || undefined,
        offerIncrement: source.offerIncrement,
        previousStatus: source.type === "OFFERABLE" ? "DRAFT" : null,
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, listingId: copy.id, status: copy.status });
  } catch (err) {
    console.error("duplicate listing failed", { sourceId, err });
    return NextResponse.json({ ok: false, error: "Duplicate listing failed." }, { status: 500 });
  }
}
