import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl;

  const canonical = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
  if (!canonical) return NextResponse.next();

  if (host.endsWith(".vercel.app")) {
    const target = new URL(canonical);
    target.pathname = url.pathname;
    target.search = url.search;
    return NextResponse.redirect(target, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon.png).*)"],
};
