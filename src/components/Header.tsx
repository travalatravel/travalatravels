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
      <Image
        src={ASSETS.logoMint}
        alt="Travala"
        width={120}
        height={32}
        className="h-7 w-auto"
        unoptimized
      />
    );
  }

  return (
    <Image
      src={isHome ? ASSETS.logoBlack : ASSETS.logoWhite}
      alt="Travala"
      width={186}
      height={40}
      className="h-6 w-auto sm:h-7 lg:h-7"
      priority
      onError={() => setImgError(true)}
      unoptimized
    />
  );
}

export default function Header({ variant = "default" }: { variant?: "home" | "default" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { messages: m } = useTranslations();
  const isHome = variant === "home";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const shellCls = isHome
    ? "sticky top-0 z-50 w-full bg-white shadow-sm lg:mx-8 lg:rounded-b-xl"
    : "sticky top-0 z-50 w-full bg-[#1a5f94] shadow-lg";

  const navLinkCls = isHome
    ? "rounded-full border border-gray-300 px-2.5 py-1 text-[13px] font-semibold text-[#220a32] transition hover:border-[#2D83C2]"
    : "rounded-md px-2.5 py-1 text-xs font-medium text-white transition hover:bg-white/15";

  const utilBtnCls = isHome
    ? "rounded-md px-2 py-1 text-xs font-semibold text-[#220a32] hover:bg-gray-100"
    : "rounded-md px-2 py-1 text-xs font-semibold text-white hover:bg-white/15";

  const registerCls = isHome
    ? "rounded-md border border-[#2D83C2] bg-[#2D83C2] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1a5f94]"
    : "rounded-md border border-white/30 bg-white px-2.5 py-1 text-xs font-semibold text-[#2D83C2] hover:bg-white/90";

  return (
    <header className={shellCls}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 lg:px-4">
        <div className="flex min-w-0 items-center gap-2 lg:gap-3">
          <Link href="/" className="min-w-0 flex-shrink-0">
            <Logo variant={variant} />
          </Link>

          <nav className="hidden items-center gap-1.5 md:flex">
            {NAV_HREFS.map((link) => (
              <Link key={link.href} href={link.href} className={`relative ${navLinkCls}`}>
                {link.badge && (
                  <span className="absolute -right-1 -top-1.5 rounded bg-[#2D83C2] px-1 py-0.5 text-[8px] font-bold text-white">
                    {m.nav.badgeNew}
                  </span>
                )}
                {m.nav[link.key]}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <LanguageSwitcher variant={variant} />
            <button type="button" className={utilBtnCls}>
              {m.common.usd}
            </button>
          </div>

          {loading ? (
            <div className={`h-7 w-16 animate-pulse rounded-md ${isHome ? "bg-gray-200" : "bg-white/20"}`} />
          ) : user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link href="/my-trips" className={`flex items-center gap-1 ${utilBtnCls}`}>
                <User size={14} />
                <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
              </Link>
              <button type="button" onClick={() => logout()} className={utilBtnCls}>
                {m.auth.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login" className={`${utilBtnCls} whitespace-nowrap`}>
                {m.auth.login}
              </Link>
              <Link href="/register" className={`${registerCls} whitespace-nowrap`}>
                {m.auth.register}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-1 md:hidden">
            <LanguageSwitcher variant={variant} compact />
            <button
              type="button"
              className={`flex-shrink-0 rounded-md p-1 ${isHome ? "text-[#220a32] hover:bg-gray-100" : "text-white hover:bg-white/15"}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? m.common.closeMenu : m.common.openMenu}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className={`max-h-[calc(100dvh-3rem)] overflow-y-auto border-t px-3 py-3 shadow-lg md:hidden ${
            isHome ? "border-gray-200 bg-white" : "border-white/10 bg-[#1a5f94]"
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
            </Link>
          ))}

          {user ? (
            <div className={`mt-3 border-t pt-3 ${isHome ? "border-gray-200" : "border-white/10"}`}>
              <Link
                href="/my-trips"
                className={`block py-2 ${isHome ? "text-[#220a32]" : "text-white"}`}
                onClick={() => setMenuOpen(false)}
              >
                {m.auth.myTrips} ({user.name})
              </Link>
              <button
                type="button"
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
                className="flex-1 rounded-lg bg-[#2D83C2] py-2 text-center text-sm font-semibold text-white"
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
