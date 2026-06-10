"use client";

import Image from "next/image";
import Link from "next/link";
import SafeImage from "./SafeImage";
import PaymentAcceptLogos from "./PaymentAcceptLogos";
import { ASSETS, FOOTER_COINS } from "@/data/site-data";
import {
  FOOTER_CITY_LINKS,
  FOOTER_COUNTRY_LINKS,
  FOOTER_NAV,
  FOOTER_REGION_LINKS,
} from "@/data/footer-links";
import { useTranslations } from "@/i18n/useTranslations";

export default function Footer() {
  const { messages: m } = useTranslations();

  return (
    <footer className="bg-[#1e2e5e] text-white">
      <div className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-12 lg:px-6">
        <div className="mb-10">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
            {m.footer.exploreHotels}
          </h3>
          <p className="mt-1 text-sm text-white/70">{m.footer.exploreSubtitle}</p>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                {m.footer.countries}
              </h4>
              <div className="flex flex-wrap gap-2">
                {FOOTER_COUNTRY_LINKS.map((c) => (
                  <Link key={c.name} href={c.href} className="text-xs text-white/80 hover:text-[#2dd4bf]">
                    {c.name}
                  </Link>
                ))}
                <Link href="/stays" className="text-xs font-semibold text-[#2dd4bf]">
                  {m.common.showMore}
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                {m.footer.regions}
              </h4>
              <div className="flex flex-wrap gap-2">
                {FOOTER_REGION_LINKS.map((r) => (
                  <Link key={r.name} href={r.href} className="text-xs text-white/80 hover:text-[#2dd4bf]">
                    {r.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                {m.footer.cities}
              </h4>
              <div className="flex flex-wrap gap-2">
                {FOOTER_CITY_LINKS.map((c) => (
                  <Link key={c.name} href={c.href} className="text-xs text-white/80 hover:text-[#2dd4bf]">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10">
          <SafeImage
            src={ASSETS.logoWhite}
            alt="Travala"
            width={140}
            height={36}
            className="mb-4 h-8 w-auto"
            fallbackClassName="mb-4 h-8 w-28 rounded bg-white/10"
          />
          <p className="mb-3 text-xs text-white/60">{m.crypto.footerPay}</p>

          <div className="mb-4 flex flex-wrap gap-2">
            {FOOTER_COINS.map((coin) => (
              <div
                key={coin.key}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 p-1"
                title={coin.name}
              >
                <Image src={coin.symbol} alt={coin.name} width={28} height={28} className="h-7 w-7 object-contain" unoptimized />
              </div>
            ))}
          </div>

          <PaymentAcceptLogos className="mb-8 opacity-90" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">
                {m.footer.sections.travala}
              </h4>
              <ul className="space-y-2">
                {FOOTER_NAV.travala.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs text-white/70 hover:text-white" target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">
                {m.footer.sections.support}
              </h4>
              <ul className="space-y-2">
                {FOOTER_NAV.support.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs text-white/70 hover:text-white" target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">
                {m.footer.sections.resources}
              </h4>
              <ul className="space-y-2">
                {FOOTER_NAV.resources.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs text-white/70 hover:text-white" target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">COMMUNITY</h4>
              <ul className="space-y-2">
                {FOOTER_NAV.community.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs text-white/70 hover:text-white" target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © 2017–2026 Travala.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
