import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Poppins } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ViewTracker from "@/components/ViewTracker";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Luxury Travel Deals — Up to 62% Off 5★ Hotels | Travala",
  description:
    "Book palace hotels, private villas and first-class flights at insider prices. Limited flash sales on Dubai, Maldives, Paris & more. Pay with crypto and save extra 20%.",
  icons: {
    icon: "https://static.travala.com/frontend/logos-v2/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
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
