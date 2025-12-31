import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "GONE", message: "Auction settlement is disabled. Bidra is offer-based." },
    { status: 410 }
  );
}
