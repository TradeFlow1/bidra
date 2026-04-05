import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "In-app payments are not part of Bidra V2." },
    { status: 410 }
  );
}
