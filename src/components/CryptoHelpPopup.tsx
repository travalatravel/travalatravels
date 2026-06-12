"use client";

import { useEffect, useState } from "react";
import {
  Bitcoin,
  Coins,
  Headphones,
  MessageCircle,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { openLiveChat } from "@/lib/open-live-chat";
import { useTranslations } from "@/i18n/useTranslations";

const STORAGE_KEY = "travala_crypto_help_popup_dismissed";

export default function CryptoHelpPopup() {
  const { messages: m } = useTranslations();
  const p = m.cryptoHelpPopup;
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  if (!visible) return null;

  const perks = [
    { icon: Wallet, text: p.perk1 },
    { icon: Coins, text: p.perk2 },
    { icon: Zap, text: p.perk3 },
  ];

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
        className="absolute inset-0 bg-[#0a1628]/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-label={p.close}
      />

      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/10 bg-white shadow-2xl shadow-[#1a5f94]/20 sm:rounded-3xl transition-all duration-300 ease-out ${
          mounted ? "translate-y-0 scale-100" : "translate-y-8 scale-[0.97] sm:translate-y-4"
        }`}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a5f94] via-[#2D83C2] to-[#220a32] px-5 pb-8 pt-6 text-white sm:px-7 sm:pb-10 sm:pt-8">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-6 left-1/4 h-24 w-24 rounded-full bg-[#e1ffde]/10 blur-2xl"
            aria-hidden
          />

          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 rounded-full p-2 text-white/80 transition hover:bg-white/15 sm:right-4 sm:top-4"
            aria-label={p.close}
          >
            <X size={20} />
          </button>

          <div className="relative flex items-start gap-4">
            <div className="flex shrink-0 flex-col gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">
                <Bitcoin size={28} strokeWidth={1.75} />
              </div>
              <div className="flex gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <MessageCircle size={18} />
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Sparkles size={18} />
                </div>
              </div>
            </div>
            <div className="min-w-0 pt-1">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#e1ffde]/90">
                <Headphones size={14} />
                {p.badge}
              </p>
              <h2 id="crypto-help-title" className="mt-1 text-xl font-black leading-tight sm:text-2xl">
                {p.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/85">{p.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-sm leading-relaxed text-gray-600">{p.body}</p>

          <ul className="mt-5 space-y-3">
            {perks.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2D83C2]/10 text-[#2D83C2]">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-[#1a1a1a]">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={startChat}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1a5f94] to-[#2D83C2] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2D83C2]/25 transition hover:brightness-110 active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              {p.ctaChat}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-600 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-1"
            >
              {p.ctaDismiss}
            </button>
          </div>

          <p className="mt-4 text-center text-[11px] text-gray-400">{p.footer}</p>
        </div>
      </div>
    </div>
  );
}
