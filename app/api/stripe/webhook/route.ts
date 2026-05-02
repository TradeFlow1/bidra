import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: "PAYMENTS_DISABLED",
      error: "In-app payments are disabled for the current Bidra launch model.",
      paymentModel: "external_handover",
      operatorNote: "Stripe webhook is intentionally disabled while Bidra does not process marketplace payments, hold pooled customer funds, or act as escrow.",
    },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
