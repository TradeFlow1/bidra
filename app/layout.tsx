import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Providers from "@/components/providers";

export const metadata = {
  title: "Bidra",
  description: "An Australian marketplace to buy and sell items safely",
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
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
