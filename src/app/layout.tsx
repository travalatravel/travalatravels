import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Satisfy } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ViewTracker from "@/components/ViewTracker";
import SiteAnalytics from "@/components/SiteAnalytics";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { LOCALE_META } from "@/i18n/config";
import { resolveLocale } from "@/i18n/detect";
import { getMessages } from "@/i18n/messages";
import "./globals.css";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const m = getMessages(locale);

  return {
    title: m.meta.title,
    description: m.meta.description,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    icons: {
      icon: [{ url: "/favicon.png", type: "image/png" }],
      shortcut: "/favicon.png",
      apple: "/favicon.png",
    },
    openGraph: {
      title: m.meta.title,
      description: m.meta.ogDescription,
      images: ["https://static.travala.com/photo/social-share-v2/social-travala.jpg"],
      siteName: m.meta.siteName,
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

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
            {children}
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
