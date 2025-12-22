import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  // Webhooks are not configured yet.
  // This placeholder prevents build/runtime failures until Stripe webhooks are set up.
  return NextResponse.json(
    { ok: true, message: "Stripe webhook not configured yet" },
    { status: 200 }
  );
}
