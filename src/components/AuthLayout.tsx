"use client";

import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/data/site-data";
import { useTranslations } from "@/i18n/useTranslations";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { messages: m } = useTranslations();

  return (
    <>
      <header className="border-b border-gray-200 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-md justify-center">
          <Link href="/" className="inline-block">
            <Image
              src={ASSETS.logoBlack}
              alt="Travala"
              width={160}
              height={40}
              className="h-8 w-auto"
              priority
              unoptimized
            />
          </Link>
        </div>
      </header>
      <div className="min-h-[calc(100dvh-8rem)] bg-gray-50 px-3 py-8 sm:px-4">{children}</div>
      <p className="border-t border-gray-200 bg-gray-50 py-4 text-center text-xs text-gray-500">
        {m.footer.copyrightLine}
      </p>
    </>
  );
}
