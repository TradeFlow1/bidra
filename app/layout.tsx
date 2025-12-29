import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/providers";
import SiteHeader from "@/components/site-header";
import ActivityPinger from "@/components/activity-pinger";

export const metadata: Metadata = {
  title: "Bidra",
  description: "Local buy/sell & auctions for South East Queensland.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ActivityPinger />
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
