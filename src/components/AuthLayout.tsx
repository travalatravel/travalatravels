"use client";

import Header from "./Header";
import { useTranslations } from "@/i18n/useTranslations";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { messages: m } = useTranslations();

  return (
    <>
      <Header />
      <div className="min-h-[calc(100dvh-4rem)] bg-gray-50 px-3 py-8 sm:px-4">{children}</div>
      <p className="border-t border-gray-200 bg-gray-50 py-4 text-center text-xs text-gray-500">
        {m.footer.copyrightLine}
      </p>
    </>
  );
}
