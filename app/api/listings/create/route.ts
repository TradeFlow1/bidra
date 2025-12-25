import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateListingBody = {
  title?: string;
  description?: string;
  category?: string;
  type?: string;
  location?: string;
  condition?: string;
  price?: number; // cents
  images?: string[];
  endsAt?: string | null;
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    const accept = (req.headers.get("accept") || "").toLowerCase();

    let title = "";
    let description = "";
    let category = "";
    let type = "BUY_NOW";
    let location = "";
    let condition = "Used - Good";
    let price = 0; // cents

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as CreateListingBody;

      title = String(body.title ?? "").trim();
      description = String(body.description ?? "").trim();
      category = String(body.category ?? "").trim();
      type = String(body.type ?? "BUY_NOW").trim();
      location = String(body.location ?? "").trim();
      condition = String(body.condition ?? "Used - Good").trim();

      price = Math.max(0, Math.round(Number(body.price ?? 0)));
    } else {
      const formData = await req.formData();

      title = String(formData.get("title") ?? "").trim();
      description = String(formData.get("description") ?? "").trim();
      category = String(formData.get("category") ?? "").trim();
      type = String(formData.get("type") ?? "BUY_NOW").trim();
      location = String(formData.get("location") ?? "").trim();
      condition = String(formData.get("condition") ?? "Used - Good").trim();

      const priceDollars = Number(formData.get("price") ?? "0");
      price = Math.max(0, Math.round(priceDollars * 100));
    }

    if (!title || !description || !category || !type || !location || !condition || price <= 0) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
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

    const isBrowserForm =
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data") ||
      accept.includes("text/html");

    if (isBrowserForm) {
      return NextResponse.redirect(new URL(`/listings/${listing.id}`, req.url));
    }

    return NextResponse.json({ ok: true, id: listing.id });
  } catch (err) {
    console.error("Create listing API error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create listing" }, { status: 500 });
  }
}
