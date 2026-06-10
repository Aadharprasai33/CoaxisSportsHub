import type { Metadata, Viewport } from "next";
import { Anton, Chakra_Petch } from "next/font/google";
import { SITE } from "@/lib/config";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const chakra = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Coaxis Sports — World Cup 2026 Live Hub",
  description:
    "Coaxis Sports: the greatest sports moments, highlights and stories. Live World Cup 2026 hub — fixtures, group tables and the Golden Boot race, all in one place.",
  openGraph: {
    title: "Coaxis Sports — WC26 Live Hub",
    description:
      "Highlights. Stories. Greatness. Plus a live World Cup 2026 match center.",
    type: "website",
    siteName: "Coaxis Sports Hub",
    images: [{ url: "/logo.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coaxis Sports — WC26 Live Hub",
    description:
      "Highlights. Stories. Greatness. Plus a live World Cup 2026 match center.",
  },
};

export const viewport: Viewport = {
  themeColor: "#04081C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${chakra.variable}`}>
      <body>{children}</body>
    </html>
  );
}
