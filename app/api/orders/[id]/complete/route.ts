import { NextResponse } from "next/server";
import { requireAdult } from "@/lib/require-adult";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  try {
    const orderId = String(ctx?.params?.id || "").trim();
    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });
    }

    const gate = await requireAdult();
    if (!gate.ok) {
      return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });
    }

    const userId = String(gate.dbUser?.id || "");
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
    }

    return NextResponse.json(
      {
        ok: false,
        error: "This legacy endpoint is retired. Orders are sold-item records. Use messages to arrange pickup or postage.",
      },
      { status: 410 }
    );
  } catch (e: any) {
    console.error("order.complete legacy endpoint failed", e);
    return NextResponse.json({ ok: false, error: "Unable to process this request." }, { status: 500 });
  }
}
