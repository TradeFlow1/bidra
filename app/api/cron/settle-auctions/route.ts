import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Placeholder: we will implement settlement later.
  // This must NOT hit the DB during build.
  return NextResponse.json({ ok: true, message: "settle-auctions disabled for now" });
}
