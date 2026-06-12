"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Check,
  CircleHelp,
  MessageCircle,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";
import { openLiveChat } from "@/lib/open-live-chat";
import { type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/useTranslations";

const STORAGE_KEY = "travala_crypto_help_popup_dismissed";
const POPUP_LOCALES: Locale[] = ["en", "de"];

const BUY_ICONS = [Smartphone, Building2, Wallet] as const;

export default function CryptoHelpPopup() {
  const router = useRouter();
  const { messages: m, locale } = useTranslations();
  const p = m.cryptoHelpPopup;
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [switchingLocale, setSwitchingLocale] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    const timer = window.setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setMounted(true));
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setMounted(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
    window.setTimeout(() => setVisible(false), 220);
  };

  const startChat = () => {
    dismiss();
    window.setTimeout(() => openLiveChat(), 250);
  };

  const switchLocale = async (next: Locale) => {
    if (next === locale || switchingLocale) return;
    setSwitchingLocale(true);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    } finally {
      setSwitchingLocale(false);
    }
  };

  if (!visible) return null;

  const buyOptions = p.buyOptions ?? [];
  const helpPoints = p.helpPoints ?? [];

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4 transition-opacity duration-200 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crypto-help-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={dismiss}
        aria-label={p.close}
      />

      <div
        className={`relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:max-h-[88vh] sm:rounded-2xl transition-all duration-300 ease-out ${
          mounted ? "translate-y-0" : "translate-y-6 sm:translate-y-3"
        }`}
      >
        <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#1a5f94]">
                <CircleHelp size={20} strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{p.badge}</p>
                <h2 id="crypto-help-title" className="mt-0.5 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
                  {p.title}
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <div
                className="flex rounded-lg border border-slate-200 bg-white p-0.5"
                role="group"
                aria-label={p.languageLabel}
              >
                {POPUP_LOCALES.map((code) => {
                  const active = locale === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      disabled={switchingLocale}
                      onClick={() => switchLocale(code)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase transition ${
                        active
                          ? "bg-[#1a5f94] text-white"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                      aria-pressed={active}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label={p.close}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.subtitle}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <section aria-labelledby="crypto-buy-heading">
            <h3 id="crypto-buy-heading" className="text-sm font-semibold text-slate-900">
              {p.buySectionTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.buySectionBody}</p>

            <ul className="mt-4 space-y-2.5">
              {buyOptions.map((option, i) => {
                const Icon = BUY_ICONS[i] ?? Wallet;
                return (
                  <li
                    key={option.title}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-3"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Icon size={16} strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{option.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{option.description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">{p.buyDisclaimer}</p>
          </section>

          <div className="my-5 border-t border-slate-100" />

          <section aria-labelledby="crypto-pay-heading">
            <h3 id="crypto-pay-heading" className="text-sm font-semibold text-slate-900">
              {p.paySectionTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.paySectionBody}</p>

            <ul className="mt-3 space-y-2">
              {helpPoints.map((point) => (
                <li key={point} className="flex gap-2 text-sm text-slate-700">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={startChat}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1a5f94] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#164d7a] active:scale-[0.99]"
            >
              <MessageCircle size={17} />
              {p.ctaChat}
              <ArrowRight size={15} className="opacity-80" />
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-1"
            >
              {p.ctaDismiss}
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-400">{p.footer}</p>
        </div>
      </div>
    </div>
  );
}
