"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Coins,
  Globe,
  Lock,
  Shield,
  TrendingDown,
  Wallet,
  Zap,
} from "lucide-react";
import CryptoPaymentMarquee from "./CryptoPaymentMarquee";
import { useTranslations } from "@/i18n/useTranslations";

const REASON_ICONS = [Globe, Shield, Coins, Wallet, TrendingDown, Lock] as const;
const STEP_ICONS = [Zap, Coins, Check] as const;

export default function CryptoFriendlySection() {
  const { messages: m } = useTranslations();
  const c = m.crypto;

  return (
    <section aria-label="Why book travel with cryptocurrency" className="overflow-hidden">
      {/* Dark hero band */}
      <div
        className="relative bg-[#220a32] px-4 py-12 text-center text-[#e1ffde] sm:py-16 lg:py-20"
        style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
      >
        <div
          className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-[#3d1458]/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#0d4d3a]/30 blur-3xl"
          aria-hidden
        />

        <p className="relative mb-2.5 text-sm font-normal uppercase tracking-wide">{c.subtitle}</p>
        <h2 className="relative text-2xl font-black leading-tight sm:text-4xl lg:text-[48px]">
          {c.headline ?? c.title}
        </h2>
        <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#e1ffde]/90 sm:text-base">
          {c.intro ?? c.body}
        </p>

        <CryptoPaymentMarquee />

        <p className="relative mx-auto mt-8 max-w-xl text-xs text-[#e1ffde]/70 sm:text-sm">{c.footerPay}</p>
      </div>

      {/* Reasons & education */}
      <div className="bg-white px-4 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <h3 className="text-center text-xl font-bold text-[#1a1a1a] sm:text-2xl">
            {c.reasonsTitle ?? "Why crypto for travel"}
          </h3>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {(c.reasons ?? []).map((reason, i) => {
              const Icon = REASON_ICONS[i] ?? Coins;
              return (
                <article
                  key={reason.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-[#2D83C2]/30 hover:shadow-sm"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D83C2]/10 text-[#2D83C2]">
                    <Icon size={20} aria-hidden />
                  </div>
                  <h4 className="font-semibold text-[#1a1a1a]">{reason.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{reason.description}</p>
                </article>
              );
            })}
          </div>

          {/* Buy crypto callout */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-[#2D83C2]/20 bg-gradient-to-br from-[#eef5fc] to-white p-6 sm:p-8 lg:flex lg:items-start lg:gap-10">
            <div className="lg:flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2D83C2]">Crypto</p>
              <h3 className="mt-2 text-lg font-bold text-[#1a1a1a] sm:text-xl">
                {c.buyCryptoTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{c.buyCryptoBody}</p>
              <ul className="mt-4 space-y-2">
                {(c.buyCryptoPoints ?? []).map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-gray-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 lg:mt-0 lg:w-80 lg:shrink-0">
              <p className="mb-4 text-sm font-semibold text-[#1a1a1a]">{c.stepsTitle}</p>
              <ol className="space-y-4">
                {(c.steps ?? []).map((step, i) => {
                  const Icon = STEP_ICONS[i] ?? Check;
                  return (
                    <li key={step.title} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a5f94] text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a]">
                          <Icon size={14} className="text-[#2D83C2]" aria-hidden />
                          {step.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/search?type=stays"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D83C2] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1a5f94] sm:w-auto"
            >
              {c.ctaBook ?? c.cta}
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/flights"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#1a1a1a] transition hover:border-[#2D83C2] hover:text-[#2D83C2] sm:w-auto"
            >
              {c.ctaFlights ?? "Search flights"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
