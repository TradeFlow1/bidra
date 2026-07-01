import type { Metadata } from "next";
import "./globals.css";
import "@/styles/bidra-reference-polish.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Providers from "@/components/providers";
import MobileBottomNav from "@/components/mobile-bottom-nav";

export const metadata: Metadata = {
  metadataBase: new URL("https://bidra.com.au"),
  title: {
    default: "Bidra | Australian marketplace for local buying and selling",
    template: "%s | Bidra",
  },
  description: "Discover active Australian marketplace listings by category, suburb, city, and postcode. Buy now or make offers while keeping pickup, postage, and handover details in Bidra Messages.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bidra | Australian marketplace for local buying and selling",
    description: "Browse Australian marketplace listings by category and location, with order records and messages in Bidra.",
    url: "/",
    siteName: "Bidra",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bidra | Australian marketplace for local buying and selling",
    description: "Discover active Australian marketplace listings by category, suburb, city, and postcode.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/brand/bidra-child-drawing-mark.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[var(--bd-app-bg)] text-[var(--bd-ink)] antialiased">
        <Providers>
          <SiteHeader />
          <main className="flex-1 bg-[linear-gradient(180deg,#fcfbfe_0%,#f7f5fa_100%)]">{children}</main>
          <SiteFooter />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
