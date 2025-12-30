import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const url = req.nextUrl;

  const canonical = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
  if (!canonical) return NextResponse.next();

  // 1) Force apex -> www (or whatever canonical host is)
  try {
    const canon = new URL(canonical);
    const canonHost = canon.host.toLowerCase();

    // If request host is the apex and canonical is www, redirect.
    if (host === "bidra.com.au" && canonHost === "www.bidra.com.au") {
      const target = new URL(canonical);
      target.pathname = url.pathname;
      target.search = url.search;
      return NextResponse.redirect(target, 308);
    }
  } catch {
    // ignore malformed canonical
  }

  // 2) Always redirect *.vercel.app to canonical
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
