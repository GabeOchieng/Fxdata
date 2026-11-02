import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "KaziHub — Kenya's Gig Economy Platform",
  description:
    "Every hustle, one platform. Find skilled pros, rent a space, buy footwear and discover 250+ service categories across Kenya — WhatsApp-native, M-Pesa-powered, zero agent fees.",
  metadataBase: new URL("https://kazihub.co.ke"),
  openGraph: {
    title: "KaziHub — Kenya's Gig Economy Platform",
    description:
      "Every hustle, one platform. 250+ services, rentals, footwear — WhatsApp-native and M-Pesa-powered.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#04060e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
