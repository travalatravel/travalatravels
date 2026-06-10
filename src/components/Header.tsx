"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { ASSETS } from "@/data/site-data";
import { useAuth } from "@/context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "@/i18n/useTranslations";

const NAV_HREFS = [
  { key: "stays" as const, href: "/stays", badge: false },
  { key: "flights" as const, href: "/flights", badge: false },
];

function Logo({ variant }: { variant: "home" | "default" }) {
  const [imgError, setImgError] = useState(false);
  const isHome = variant === "home";

  if (imgError) {
    return (
      <span
        className={`font-[family-name:var(--font-display)] text-lg font-bold tracking-tight sm:text-xl ${
          isHome ? "text-[#220a32]" : "text-white"
        }`}
      >
        <Image src={ASSETS.logoMint} alt="Travala" width={120} height={32} className="h-7 w-auto" unoptimized />
      </span>
    );
  }

  return (
    <Image
      src={isHome ? ASSETS.logoDark : ASSETS.logoWhite}
      alt="Travala"
      width={186}
      height={40}
      className="h-6 w-auto sm:h-7 lg:h-7"
      priority
      onError={() => setImgError(true)}
    />
  );
}

export default function Header({ variant = "default" }: { variant?: "home" | "default" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { messages: m, fmt } = useTranslations();
  const isHome = variant === "home";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const shellCls = isHome
    ? "sticky top-0 z-50 w-full bg-white shadow-sm lg:mx-8 lg:rounded-b-xl"
    : "sticky top-0 z-50 w-full bg-[#1e2e5e] shadow-lg";

  const navLinkCls = isHome
    ? "rounded-full border border-gray-300 px-2.5 py-1 text-[13px] font-semibold text-[#220a32] transition hover:border-[#220a32]"
    : "rounded-md px-2.5 py-1 text-xs font-medium text-white transition hover:bg-white/15";

  const utilBtnCls = isHome
    ? "rounded-md px-2 py-1 text-xs font-semibold text-[#220a32] hover:bg-gray-100"
    : "rounded-md px-2 py-1 text-xs text-white hover:bg-white/15";

  return (
    <header className={shellCls}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 lg:px-4">
        <div className="flex min-w-0 items-center gap-2 lg:gap-3">
          <Link href="/" className="min-w-0 flex-shrink-0">
            <Logo variant={variant} />
          </Link>

          <nav className="hidden items-center gap-1.5 lg:flex">
            {NAV_HREFS.map((link) => (
              <Link key={link.href} href={link.href} className={`relative ${navLinkCls}`}>
                {link.badge && (
                  <span className="absolute -right-1 -top-1.5 rounded bg-[#2dd4bf] px-1 py-0.5 text-[8px] font-bold text-[#1e2e5e]">
                    {m.nav.badgeNew}
                  </span>
                )}
                {m.nav[link.key]}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          <LanguageSwitcher variant={variant} />
          <button className={utilBtnCls}>{m.common.usd}</button>

          {loading ? (
            <div className={`h-7 w-16 animate-pulse rounded-md ${isHome ? "bg-gray-200" : "bg-white/20"}`} />
          ) : user ? (
            <>
              <Link href="/my-trips" className={`flex items-center gap-1 ${utilBtnCls}`}>
                <User size={14} />
                {user.name.split(" ")[0]}
              </Link>
              <button onClick={() => logout()} className={utilBtnCls}>
                {m.auth.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={utilBtnCls}>
                {m.auth.login}
              </Link>
              <Link
                href="/register"
                className={
                  isHome
                    ? "rounded-md border border-[#220a32] px-2.5 py-1 text-xs font-semibold text-[#220a32] hover:bg-[#220a32] hover:text-white"
                    : "rounded-md bg-[#2dd4bf] px-2.5 py-1 text-xs font-semibold text-[#1e2e5e] hover:bg-[#14b8a6]"
                }
              >
                {m.auth.register}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher variant={variant} compact />
          <button
            className={`flex-shrink-0 rounded-md p-1 ${isHome ? "text-[#220a32] hover:bg-gray-100" : "text-white hover:bg-white/15"}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? m.common.closeMenu : m.common.openMenu}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className={`max-h-[calc(100dvh-3rem)] overflow-y-auto border-t px-3 py-3 shadow-lg lg:hidden ${
            isHome ? "border-gray-200 bg-white" : "border-white/10 bg-[#1e2e5e]"
          }`}
        >
          {NAV_HREFS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block border-b py-3 ${isHome ? "border-gray-100 text-[#220a32]" : "border-white/5 text-white"}`}
              onClick={() => setMenuOpen(false)}
            >
              {m.nav[link.key]}
              {link.badge && (
                <span className="ml-2 rounded bg-[#2dd4bf] px-1.5 py-0.5 text-[8px] font-bold text-[#1e2e5e]">
                  {m.nav.badgeNew}
                </span>
              )}
            </Link>
          ))}

          {user ? (
            <div className={`mt-3 border-t pt-3 ${isHome ? "border-gray-200" : "border-white/10"}`}>
              <Link
                href="/my-trips"
                className={`block py-2 ${isHome ? "text-[#220a32]" : "text-white"}`}
                onClick={() => setMenuOpen(false)}
              >
                {fmt(m.auth.myTrips)} ({user.name})
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className={isHome ? "text-gray-500" : "text-white/70"}
              >
                {m.auth.logout}
              </button>
            </div>
          ) : (
            <div className={`mt-3 flex gap-2 border-t pt-3 ${isHome ? "border-gray-200" : "border-white/10"}`}>
              <Link
                href="/login"
                className={`flex-1 rounded-lg border py-2 text-center text-sm ${
                  isHome ? "border-gray-300 text-[#220a32]" : "border-white/30 text-white"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {m.auth.login}
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-lg bg-[#2dd4bf] py-2 text-center text-sm font-semibold text-[#1e2e5e]"
                onClick={() => setMenuOpen(false)}
              >
                {m.auth.register}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
