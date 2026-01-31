import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function isProtected(pathname: string) {
  // Public routes + static assets are NOT protected (middleware should not redirect them)
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/feedback") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/browse") ||
    pathname.startsWith("/listings") ||
    pathname === "/" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/prohibited-items"
  ) {
    return false;
  }

  // Protected app areas (explicit). Everything else is public (including unknown routes → proper 404)
  return (
    pathname.startsWith("/sell") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/watchlist")
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
  const url = req.nextUrl;
  const pathname = url.pathname;

  // NEVER redirect/gate auth pages or NextAuth
  if (pathname.startsWith("/auth")) return NextResponse.next();
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // NEVER redirect/gate API routes (APIs enforce auth/18+ internally)
  if (pathname.startsWith("/api")) return NextResponse.next();

  // NEVER touch static / brand assets
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/brand")
  ) {
    return NextResponse.next();
  }

  const proto = String(req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")).toLowerCase();
  const host = String(req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").toLowerCase();

  const canonical = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "");

  // 0) Force HTTPS (prefer canonical to avoid double redirects)
  if (proto === "http") {
    if (canonical) {
      try {
        const target = new URL(canonical);
        target.protocol = "https:";
        target.pathname = url.pathname;
        target.search = url.search;
        return NextResponse.redirect(target, 308);
      } catch {
        // ignore malformed canonical; fall through to same-host https redirect
      }
    }
    const target = url.clone();
    target.protocol = "https:";
    return NextResponse.redirect(target, 308);
  }

  if (canonical) {
    // 1) Force apex -> canonical host (prevents host-only cookie mismatch)
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

  // Only gate real app pages that need auth/18+
  if (!isProtected(pathname)) return NextResponse.next();

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
  matcher: [
    "/((?!_next|favicon.ico|icon.png|robots.txt|sitemap.xml|brand|auth|api).*)",
  ],
};
