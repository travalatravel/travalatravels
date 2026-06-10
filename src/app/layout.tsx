import type { Metadata } from "next";
import { Suspense } from "react";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ViewTracker from "@/components/ViewTracker";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Book Hotels, Flights, Tours & Car Rental with Crypto | Travala",
  description:
    "Book over 3 million travel products around the world with popular cryptocurrencies. Find and book Hotels, Flights, Car Rental, Tours and Activities online.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} min-w-0 overflow-x-hidden antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <ViewTracker />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
