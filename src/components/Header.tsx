"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Globe, Menu, X, User } from "lucide-react";
import { ASSETS, NAV_LINKS } from "@/data/site-data";
import { useAuth } from "@/context/AuthContext";

function Logo() {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <span className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-white">
        Trav<span className="text-[#2dd4bf]">ala</span>
      </span>
    );
  }

  return (
    <Image
      src={ASSETS.logoWhite}
      alt="Travala"
      width={140}
      height={36}
      className="h-8 w-auto lg:h-9"
      priority
      onError={() => setImgError(true)}
    />
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-[#1e2e5e] shadow-lg"
          : "bg-[#1e2e5e]/95 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Link href="/" className="flex-shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              {link.badge && (
                <span className="absolute -top-1 right-0 rounded bg-[#2dd4bf] px-1.5 py-0.5 text-[9px] font-bold text-[#1e2e5e]">
                  {link.badge}
                </span>
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/15">
            <Globe size={16} />
            <span>EN</span>
          </button>
          <button className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-white/15">
            USD
          </button>

          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-white/20" />
          ) : user ? (
            <>
              <Link
                href="/my-trips"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/15"
              >
                <User size={16} />
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={() => logout()}
                className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/15 hover:text-white"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#2dd4bf] px-4 py-2 text-sm font-semibold text-[#1e2e5e] transition hover:bg-[#14b8a6]"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-1 text-white hover:bg-white/15 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#1e2e5e] px-4 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-white"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="mt-4 border-t border-white/10 pt-4">
              <Link href="/my-trips" className="block py-2 text-white" onClick={() => setMenuOpen(false)}>
                My Trips ({user.name})
              </Link>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="py-2 text-white/70"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">
              <Link
                href="/login"
                className="flex-1 rounded-lg border border-white/30 py-2 text-center text-white"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-lg bg-[#2dd4bf] py-2 text-center font-semibold text-[#1e2e5e]"
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
