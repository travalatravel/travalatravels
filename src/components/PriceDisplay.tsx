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
  const displayPrice = showCrypto ? p.cryptoPrice : p.salePrice;
  const suffix = perNight ? " / night" : "";

  const priceCls =
    size === "lg"
      ? "text-xl font-bold sm:text-2xl lg:text-3xl"
      : size === "sm"
        ? "text-lg font-bold"
        : "text-xl font-bold";

  return (
    <div className="min-w-0 max-w-full">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={`${priceCls} text-[#1e2e5e]`}>
          {formatUsd(displayPrice)}
          {suffix && <span className="text-sm font-normal text-gray-500">{suffix}</span>}
        </span>
        {p.discountPct > 0 && (
          <span className="rounded bg-[#2dd4bf]/20 px-2 py-0.5 text-[11px] font-semibold text-[#1e2e5e]">
            -{p.discountPct}%
          </span>
        )}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
        {p.originalPrice > displayPrice && (
          <span className="text-gray-400 line-through">{formatUsd(p.originalPrice)}</span>
        )}
        {p.savings > 0 && (
          <span className="font-medium text-[#2577be]">Save {formatUsd(p.savings)}</span>
        )}
      </div>
      {showCrypto && (
        <p className="mt-1 text-xs text-gray-500">
          or {formatUsd(p.cryptoPrice)}
          {perNight ? "/night" : ""} with crypto
        </p>
      )}
    </div>
  );
}
