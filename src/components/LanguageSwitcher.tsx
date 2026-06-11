"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as FlagIcons from "country-flag-icons/react/3x2";
import { ChevronDown } from "lucide-react";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/useTranslations";

function LocaleFlag({ code, className }: { code: string; className?: string }) {
  const Flag = FlagIcons[code as keyof typeof FlagIcons];
  if (!Flag) return null;
  return <Flag className={className} aria-hidden />;
}

export default function LanguageSwitcher({
  variant = "default",
  compact = false,
}: {
  variant?: "home" | "default";
  compact?: boolean;
}) {
  const { locale } = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALE_META[locale];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectLocale = async (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
  };

  const btnCls =
    "rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-white/15 sm:px-2 sm:py-1 sm:text-xs lg:text-[#220a32] lg:hover:bg-gray-100";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 ${btnCls}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <LocaleFlag code={current.flag} className="h-3 w-[18px] rounded-[2px] object-cover shadow-sm" />
        {!compact && <span className="uppercase">{locale}</span>}
        <ChevronDown size={12} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute right-0 top-[calc(100%+0.35rem)] z-[60] max-h-[min(20rem,70vh)] min-w-[11rem] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-2xl`}
        >
          {LOCALES.map((code) => {
            const meta = LOCALE_META[code];
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => selectLocale(code)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                  active
                    ? "bg-[#eef5fc] font-semibold text-[#2D83C2]"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                <LocaleFlag code={meta.flag} className="h-3.5 w-[21px] rounded-[2px] object-cover shadow-sm" />
                <span className="flex-1">{meta.label}</span>
                <span className="text-[10px] uppercase opacity-60">{code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
