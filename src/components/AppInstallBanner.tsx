"use client";

import { useState } from "react";
import { Smartphone, X } from "lucide-react";

export default function AppInstallBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="border-b border-[#2577be]/20 bg-[#eef5fc] px-3 py-2.5 sm:px-4">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#2577be] text-white">
          <Smartphone size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#1e2e5e]">Travala.com App</p>
          <p className="truncate text-xs text-gray-600">Quick and easy travel bookings!</p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 rounded-lg bg-[#2577be] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e2e5e]"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="flex-shrink-0 rounded p-1 text-gray-500 hover:bg-white/60"
          aria-label="Dismiss app banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
