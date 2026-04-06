import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const backTo = new URL("/admin/events", req.url);
  backTo.searchParams.set("type", "ORDER_RESCHEDULE_REQUESTED");
  backTo.searchParams.set("disabled", "1");
  return NextResponse.redirect(backTo);
}