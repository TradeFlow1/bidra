import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://bidra.com.au"),
  title: {
    default: "Bidra | Australian marketplace for local buying and selling",
    template: "%s | Bidra",
  },
  description: "Discover active Australian marketplace listings by category, suburb, city, and postcode. Buy Now or make offers while keeping pickup, postage, and handover details in Bidra Messages.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bidra | Australian marketplace for local buying and selling",
    description: "Browse active Australian marketplace listings by category and location, then buy safely with Bidra order records and Messages.",
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
    icon: "/brand/bidra-kangaroo-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
