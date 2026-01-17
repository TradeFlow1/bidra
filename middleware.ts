import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function isPublic(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/register/") ||
    pathname.startsWith("/auth/verify") ||
    pathname.startsWith("/auth/phone-verify") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/support") ||
    pathname === "/" ||
    pathname.startsWith("/listings")
  );
}

function needsPhoneGate(pathname: string) {
  // IMPORTANT: keep phone verification gate OFF unless explicitly enabled.
  if (String(process.env.PHONE_GATE_ENABLED ?? "").trim() !== "1") return false;

  return (
    pathname.startsWith("/sell") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/watchlist")
  );
}

export async function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const url = req.nextUrl;

  const canonical = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
  if (canonical) {
    // 1) Force apex -> www (or whatever canonical host is)
    try {
      const canon = new URL(canonical);
      const canonHost = canon.host.toLowerCase();

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
  }

  // 3) Phone verification gate (STEP 1E)
  const pathname = url.pathname;
  if (isPublic(pathname)) return NextResponse.next();

  const token: any = await getToken({ req });
  if (!token) {
    const target = url.clone();
    target.pathname = "/auth/login";
    const nextPath = pathname + (url.search || "");
    target.searchParams.set("next", nextPath);
    return NextResponse.redirect(target);
  }

  const emailVerified = Boolean(token?.emailVerified);
  const phoneVerified = Boolean(token?.phoneVerified);

  if (emailVerified && !phoneVerified && needsPhoneGate(pathname)) {
    const target = url.clone();
    target.pathname = "/auth/phone-verify";
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon.png|brand|robots.txt|sitemap.xml).*)"],
};
