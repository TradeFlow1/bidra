import type { Metadata } from "next";
import "./globals.css";
import "@/styles/bidra-reference-polish.css";
import Providers from "@/components/providers";

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
      <body className="min-h-screen bg-[var(--mk-bg)] text-[var(--mk-ink)] antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
