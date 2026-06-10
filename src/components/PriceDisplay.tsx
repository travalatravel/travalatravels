import { getOfferPricing, formatUsd } from "@/lib/pricing";

export default function PriceDisplay({
  price,
  offerId,
  stars,
  size = "md",
  showCrypto = false,
  perNight = false,
}: {
  price: number;
  offerId: string;
  stars?: number | null;
  size?: "sm" | "md" | "lg";
  showCrypto?: boolean;
  perNight?: boolean;
}) {
  const p = getOfferPricing(price, offerId, stars);
  const suffix = perNight ? "/night" : "";

  const priceCls =
    size === "lg"
      ? "text-3xl font-bold"
      : size === "sm"
        ? "text-lg font-bold"
        : "text-xl font-bold";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${priceCls} text-[#1e2e5e]`}>
          {formatUsd(showCrypto ? p.cryptoPrice : p.salePrice)}
          {suffix && <span className="text-sm font-normal text-gray-400">{suffix}</span>}
        </span>
        <span className="rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
          -{p.discountPct}%
        </span>
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-400 line-through">{formatUsd(p.originalPrice)}</span>
        <span className="font-semibold text-emerald-600">Save {formatUsd(p.savings)}</span>
      </div>
      {showCrypto && (
        <p className="mt-1 text-xs font-medium text-[#2577be]">
          Extra {p.cryptoExtraPct}% off with crypto
        </p>
      )}
    </div>
  );
}
