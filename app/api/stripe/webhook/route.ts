import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  // Webhooks are not configured yet.
  // Temporary stub: keeps build/runtime stable until Stripe webhooks are configured.
  return NextResponse.json(
    { ok: true, message: "Stripe webhook not configured yet" },
    { status: 200 }
  );
}
