"use client";

import Image from "next/image";
import { CRYPTO_PAYMENT_OPTIONS } from "@/data/site-data";

export default function CryptoPaymentMarquee() {
  const coins = [...CRYPTO_PAYMENT_OPTIONS, ...CRYPTO_PAYMENT_OPTIONS];

  return (
    <div className="relative mx-auto mt-10 max-w-6xl overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#220a32] to-transparent sm:w-24"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#220a32] to-transparent sm:w-24"
        aria-hidden
      />
      <div className="flex animate-[marquee_40s_linear_infinite] gap-4 sm:gap-5">
        {coins.map((coin, i) => (
          <div
            key={`${coin.key}-${i}`}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center sm:h-20 sm:w-20 sm:rounded-full sm:bg-white/[0.08] sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.25)] sm:backdrop-blur-sm"
            title={coin.name}
          >
            <Image
              src={coin.symbol}
              alt={coin.name}
              width={44}
              height={44}
              className="h-9 w-9 object-contain mix-blend-screen sm:h-11 sm:w-11 sm:mix-blend-normal"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
