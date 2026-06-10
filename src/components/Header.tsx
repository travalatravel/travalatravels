"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Globe, Menu, X, User } from "lucide-react";
import { ASSETS, NAV_LINKS } from "@/data/site-data";
import { useAuth } from "@/context/AuthContext";

function Logo({ variant }: { variant: "home" | "default" }) {
  const [imgError, setImgError] = useState(false);
  const isHome = variant === "home";

  if (imgError) {
    return (
      <span
        className={`font-[family-name:var(--font-display)] text-xl font-bold tracking-tight sm:text-2xl ${
          isHome ? "text-[#220a32]" : "text-white"
        }`}
      >
        Trav<span className="text-[#2dd4bf]">ala</span>
      </span>
    );
  }

  return (
    <Image
      src={isHome ? ASSETS.logoDark : ASSETS.logoWhite}
      alt="Travala"
      width={186}
      height={40}
      className="h-7 w-auto sm:h-8 lg:h-9"
      priority
      onError={() => setImgError(true)}
    />
  );
}

export default function Header({ variant = "default" }: { variant?: "home" | "default" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const isHome = variant === "home";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const shellCls = isHome
    ? "sticky top-0 z-50 w-full bg-white shadow-sm lg:mx-16 lg:rounded-b-2xl"
    : "sticky top-0 z-50 w-full bg-[#1e2e5e] shadow-lg";

  const navLinkCls = isHome
    ? "rounded-full border-[1.5px] border-gray-300 px-4 py-2.5 text-[15px] font-semibold text-[#220a32] transition hover:border-[#220a32]"
    : "rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15";

  const utilBtnCls = isHome
    ? "rounded-lg px-3 py-2 text-sm font-semibold text-[#220a32] hover:bg-gray-100"
    : "rounded-lg px-3 py-2 text-sm text-white hover:bg-white/15";

  return (
    <header className={shellCls}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-4 lg:gap-5">
          <Link href="/" className="min-w-0 flex-shrink-0">
            <Logo variant={variant} />
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={`relative ${navLinkCls}`}>
                {link.badge && (
                  <span className="absolute -right-1 -top-2 rounded bg-[#2dd4bf] px-1.5 py-0.5 text-[9px] font-bold text-[#1e2e5e]">
                    {link.badge}
                  </span>
                )}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button className={`flex items-center gap-1.5 ${utilBtnCls}`}>
            <Globe size={16} />
            <span>EN</span>
          </button>
          <button className={utilBtnCls}>USD</button>

          {loading ? (
            <div className={`h-8 w-20 animate-pulse rounded-lg ${isHome ? "bg-gray-200" : "bg-white/20"}`} />
          ) : user ? (
            <>
              <Link href="/my-trips" className={`flex items-center gap-1.5 ${utilBtnCls}`}>
                <User size={16} />
                {user.name.split(" ")[0]}
              </Link>
              <button onClick={() => logout()} className={utilBtnCls}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={utilBtnCls}>
                Log in
              </Link>
              <Link
                href="/register"
                className={
                  isHome
                    ? "rounded-lg border border-[#220a32] px-4 py-2 text-sm font-semibold text-[#220a32] hover:bg-[#220a32] hover:text-white"
                    : "rounded-lg bg-[#2dd4bf] px-4 py-2 text-sm font-semibold text-[#1e2e5e] hover:bg-[#14b8a6]"
                }
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className={`flex-shrink-0 rounded-lg p-1.5 lg:hidden ${isHome ? "text-[#220a32] hover:bg-gray-100" : "text-white hover:bg-white/15"}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className={`max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t px-4 py-4 shadow-lg lg:hidden ${
            isHome ? "border-gray-200 bg-white" : "border-white/10 bg-[#1e2e5e]"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block border-b py-3.5 ${isHome ? "border-gray-100 text-[#220a32]" : "border-white/5 text-white"}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
              {link.badge && (
                <span className="ml-2 rounded bg-[#2dd4bf] px-1.5 py-0.5 text-[9px] font-bold text-[#1e2e5e]">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          {/* mobile auth — same as before */}
          {user ? (
            <div className={`mt-4 border-t pt-4 ${isHome ? "border-gray-200" : "border-white/10"}`}>
              <Link
                href="/my-trips"
                className={`block py-2.5 ${isHome ? "text-[#220a32]" : "text-white"}`}
                onClick={() => setMenuOpen(false)}
              >
                My Trips ({user.name})
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className={isHome ? "text-gray-500" : "text-white/70"}
              >
                Log out
              </button>
            </div>
          ) : (
            <div className={`mt-4 flex gap-3 border-t pt-4 ${isHome ? "border-gray-200" : "border-white/10"}`}>
              <Link
                href="/login"
                className={`flex-1 rounded-lg border py-2.5 text-center text-sm ${
                  isHome ? "border-gray-300 text-[#220a32]" : "border-white/30 text-white"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-lg bg-[#2dd4bf] py-2.5 text-center text-sm font-semibold text-[#1e2e5e]"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
