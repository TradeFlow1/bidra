import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "GONE", message: "Bidding is disabled. Bidra is offer-based (AU compliance)." },
    { status: 410 }
  );
}
