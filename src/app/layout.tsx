import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Satisfy } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ViewTracker from "@/components/ViewTracker";
import SiteAnalytics from "@/components/SiteAnalytics";
import AppBanner from "@/components/AppBanner";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { LOCALE_META } from "@/i18n/config";
import { resolveLocale } from "@/i18n/detect";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
});

const satisfy = Satisfy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-satisfy",
});

export const metadata: Metadata = {
  title: "Book Hotels, Flights, Tours & Car Rental with Crypto | Travala",
  description:
    "Book over 3 million travel products around the world with popular cryptocurrencies. Find and book Hotels, Flights, Car Rental, Tours and Activities online.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "https://static.travala.com/frontend/logos-v2/favicon.png",
  },
  openGraph: {
    title: "Book Hotels, Flights, Tours & Car Rental with Crypto | Travala",
    description:
      "Book over 3 million travel products around the world with popular cryptocurrencies.",
    images: ["https://static.travala.com/photo/social-share-v2/social-travala.jpg"],
    siteName: "Travala",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveLocale();
  const dir = LOCALE_META[locale].dir;

  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.variable} ${satisfy.variable} min-w-0 overflow-x-hidden antialiased`}>
        <SiteAnalytics />
        <LocaleProvider locale={locale}>
          <AuthProvider>
            <Suspense fallback={null}>
              <ViewTracker />
            </Suspense>
            <AppBanner />
            {children}
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
