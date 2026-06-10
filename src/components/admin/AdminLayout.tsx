"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Wallet,
  LogOut,
  ArrowLeft,
  Settings,
  Eye,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/views", label: "Page Views", icon: Eye },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/wallets", label: "Crypto Wallets", icon: Wallet },
  { href: "/admin/settings", label: "Security", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const [authState, setAuthState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    if (isLoginPage) return;

    fetch("/api/admin/auth/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthState("ok");
        } else {
          setAuthState("denied");
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        setAuthState("denied");
        router.replace("/admin/login");
      });
  }, [isLoginPage, router, pathname]);

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authState !== "ok") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-[#1e2e5e] text-white">
        <div className="border-b border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">Travala Admin</p>
          <p className="mt-1 text-sm text-white/70">Password protected</p>
        </div>
        <nav className="p-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                pathname === href
                  ? "bg-[#2577be] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
          <Link
            href="/"
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <ArrowLeft size={16} /> Back to Site
          </Link>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
