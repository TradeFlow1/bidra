import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: "Bidra",
  description: "Buy, sell, and bid - built for Australia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
