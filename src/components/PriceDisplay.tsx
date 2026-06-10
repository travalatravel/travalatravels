"use client";

import { getOfferPricing, formatUsd } from "@/lib/pricing";
import { useTranslations } from "@/i18n/useTranslations";

export default function PriceDisplay({
  price,
  offerId,
  stars,
  size = "md",
  showCrypto = false,
  perNight = false,
  livePricePerNight,
  priceLoading = false,
  isLive = false,
}: {
  price: number;
  offerId: string;
  stars?: number | null;
  size?: "sm" | "md" | "lg";
  showCrypto?: boolean;
  perNight?: boolean;
  livePricePerNight?: number | null;
  priceLoading?: boolean;
  isLive?: boolean;
}) {
  const { messages: m, fmt } = useTranslations();
  const basePrice = livePricePerNight != null && livePricePerNight > 0 ? livePricePerNight : price;
  const p = getOfferPricing(basePrice, offerId, stars);
  const displayPrice = showCrypto ? p.cryptoPrice : p.salePrice;
  const suffix = perNight ? m.common.perNight : "";

  const priceCls =
    size === "lg"
      ? "text-xl font-bold sm:text-2xl lg:text-3xl"
      : size === "sm"
        ? "text-lg font-bold"
        : "text-xl font-bold";

  return (
    <div className="min-w-0 max-w-full">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={`${priceCls} text-[#1a1a1a]`}>
          {formatUsd(displayPrice)}
          {suffix && <span className="text-sm font-normal text-gray-500">{suffix}</span>}
        </span>
        {p.discountPct > 0 && (
          <span className="rounded bg-[#2D83C2]/20 px-2 py-0.5 text-[11px] font-semibold text-[#1a1a1a]">
            -{p.discountPct}%
          </span>
        )}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
        {p.originalPrice > displayPrice && (
          <span className="text-gray-400 line-through">{formatUsd(p.originalPrice)}</span>
        )}
        {p.savings > 0 && (
          <span className="font-medium text-[#2D83C2]">{fmt(m.common.youSave, { amount: formatUsd(p.savings) })}</span>
        )}
      </div>
      {priceLoading && !isLive && (
        <p className="mt-1 text-xs text-gray-400">{m.priceDisplay.updatingLive}</p>
      )}
      {isLive && (
        <p className="mt-1 text-xs font-medium text-emerald-700">{m.priceDisplay.liveRateForDates}</p>
      )}
      {showCrypto && (
        <p className="mt-1 text-xs text-gray-500">{m.priceDisplay.cryptoAccepted}</p>
      )}
    </div>
  );
}
