import { NextResponse } from "next/server";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { listingLooksProhibited } from "@/lib/prohibited-items";

export const dynamic = "force-dynamic";

function clean(value: unknown, max = 1000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function dollarsToCents(value: unknown) {
  const raw = String(value || "").replace(/[^0-9.]/g, "");
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export async function POST(req: Request) {
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, reason: gate.reason }, { status: gate.status });
  }

  const userId = gate.session?.user?.id ? String(gate.session.user.id) : "";
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = clean(body.title, 120);
  const description = clean(body.description, 2000);
  const category = clean(body.category, 120);
  const location = clean(body.location, 160);
  const budgetMin = dollarsToCents(body.budgetMin);
  const budgetMax = dollarsToCents(body.budgetMax);

  if (title.length < 3) return NextResponse.json({ ok: false, error: "Title must be at least 3 characters." }, { status: 400 });
  if (description.length < 20) return NextResponse.json({ ok: false, error: "Describe what you are looking for in at least 20 characters." }, { status: 400 });
  if (!category) return NextResponse.json({ ok: false, error: "Category is required." }, { status: 400 });
  if (!location) return NextResponse.json({ ok: false, error: "Location is required." }, { status: 400 });
  if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
    return NextResponse.json({ ok: false, error: "Minimum budget cannot be higher than maximum budget." }, { status: 400 });
  }

  if (listingLooksProhibited({ title, description, category, tags: null, images: null })) {
    return NextResponse.json({ ok: false, error: "This wanted request is not permitted on Bidra." }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const wanted = await prisma.wantedAd.create({
    data: {
      title,
      description,
      category,
      location,
      budgetMin,
      budgetMax,
      buyerId: userId,
      expiresAt,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, wantedId: wanted.id }, { status: 201 });
}
