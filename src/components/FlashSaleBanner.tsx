"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Clock } from "lucide-react";

function getCountdown() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end.getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export default function FlashSaleBanner() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    setMounted(true);
    setTime(getCountdown());
    const t = setInterval(() => setTime(getCountdown()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#1e2e5e] to-[#0f172a] px-3 py-2 text-white sm:px-4 sm:py-2.5">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI2IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMyIvPjwvZz48L3N2Zz4=')] opacity-40" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-center text-xs sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2 sm:text-sm">
        <span className="inline-flex items-center gap-1.5 font-bold text-amber-400">
          <Flame size={14} className="flex-shrink-0 animate-pulse sm:h-4 sm:w-4" />
          <span className="leading-snug">
            <span className="sm:hidden">Flash sale — up to 62% off</span>
            <span className="hidden sm:inline">LUXURY FLASH SALE — Up to 62% OFF 5★ Resorts</span>
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-white/70">
          <Clock size={13} />
          Ends{" "}
          <span className="font-mono font-bold text-white" suppressHydrationWarning>
            {mounted
              ? `${pad(time.h)}:${pad(time.m)}:${pad(time.s)}`
              : "--:--:--"}
          </span>
        </span>
        <Link
          href="/search?type=stays&q=dubai"
          className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-[#0f172a] transition hover:bg-amber-400 sm:px-4 sm:text-xs"
        >
          Grab deals →
        </Link>
      </div>
    </div>
  );
}
