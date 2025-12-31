import { NextResponse } from "next/server";


import { requireAdult } from "@/lib/require-adult";
export async function POST() {
  
  const gate = await requireAdult();
  if (!gate.ok) {
    return new Response(JSON.stringify({ ok: false, reason: gate.reason }), {
      status: gate.status,
      headers: { "content-type": "application/json" },
    });
  }
return NextResponse.json(
    { ok: false, error: "GONE", message: "Bidding is disabled. Bidra is offer-based (AU compliance)." },
    { status: 410 }
  );
}
