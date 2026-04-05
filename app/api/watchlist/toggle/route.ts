import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Watchlist is not part of this Bidra launch." }, { status: 410 });
}
