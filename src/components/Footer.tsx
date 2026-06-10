"use client";

import Link from "next/link";
import SafeImage from "./SafeImage";
import CoinIcon from "./CoinIcon";
import { FOOTER_CITIES, FOOTER_COUNTRIES, FOOTER_COINS, FOOTER_REGIONS } from "@/data/site-data";
import { useTranslations } from "@/i18n/useTranslations";

const SOCIAL = ["Twitter", "Facebook", "Telegram", "Instagram", "Reddit", "Linkedin", "Discord"];

export default function Footer() {
  const { messages: m, fmt } = useTranslations();
  const year = new Date().getFullYear();

  const footerSections = [
    { key: "travala" as const, links: ["priceGuarantee", "mobileApp", "businessTravel"] as const },
    { key: "support" as const, links: ["helpCenter", "myTrip", "terms", "privacy", "cookies", "contact", "concierge", "bugReport"] as const },
    { key: "resources" as const, links: ["reviews", "careers"] as const },
  ];

  return (
    <footer className="bg-[#1e2e5e] text-white">
      <div className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-12 lg:px-6">
        <div className="mb-10">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
            {m.footer.exploreHotels}
          </h3>
          <p className="mt-1 text-sm text-white/70">
            {m.footer.exploreSubtitle}
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">{m.footer.countries}</h4>
              <div className="flex flex-wrap gap-2">
                {FOOTER_COUNTRIES.map((c) => (
                  <Link key={c} href={`/search?type=stays&q=${encodeURIComponent(c)}`} className="text-xs text-white/80 hover:text-[#2dd4bf]">{c}</Link>
                ))}
                <Link href="/search?type=stays" className="text-xs font-semibold text-[#2dd4bf]">{m.common.showMore}</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">{m.footer.regions}</h4>
              <div className="flex flex-wrap gap-2">
                {FOOTER_REGIONS.map((r) => (
                  <Link key={r} href={`/search?type=stays&q=${encodeURIComponent(r)}`} className="text-xs text-white/80 hover:text-[#2dd4bf]">{r}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">{m.footer.cities}</h4>
              <div className="flex flex-wrap gap-2">
                {FOOTER_CITIES.map((c) => (
                  <Link key={c} href={`/search?type=stays&q=${encodeURIComponent(c)}`} className="text-xs text-white/80 hover:text-[#2dd4bf]">{c}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10">
          <SafeImage
            src="/logo-white.svg"
            alt="Travala"
            width={120}
            height={32}
            className="mb-4 h-8 w-auto"
            fallbackClassName="mb-4 h-8 w-28 rounded bg-white/10"
          />
          <p className="mb-3 text-xs text-white/60">
            {m.crypto.footerPay}
          </p>
          <div className="mb-8 flex flex-wrap gap-3">
            {FOOTER_COINS.map((coin) => (
              <div
                key={coin}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 p-0.5"
              >
                <CoinIcon coin={coin} size={36} />
              </div>
            ))}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.key}>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">{m.footer.sections[section.key]}</h4>
                <ul className="space-y-2">
                  {section.links.map((linkKey) => (
                    <li key={linkKey}>
                      <span className="text-xs text-white/70">{m.footer.links[linkKey]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">COMMUNITY</h4>
              <ul className="space-y-2">
                {SOCIAL.map((s) => (
                  <li key={s}>
                    <span className="text-xs text-white/70">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          {fmt(m.footer.copyright, { year })}
        </div>
      </div>
    </footer>
  );
}
