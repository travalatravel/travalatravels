import AppInstallBanner from "./AppInstallBanner";
import Header from "./Header";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppInstallBanner />
      <Header />
      <div className="min-h-[calc(100dvh-8rem)] bg-gray-50 px-3 py-8 sm:px-4">{children}</div>
      <p className="border-t border-gray-200 bg-gray-50 py-4 text-center text-xs text-gray-500">
        © Copyright 2017 - 2026.{" "}
        <Link href="/" className="text-[#2577be] hover:underline">
          Travala.com
        </Link>
      </p>
    </>
  );
}
