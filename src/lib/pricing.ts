export type OfferPricing = {
  salePrice: number;
  originalPrice: number;
  discountPct: number;
  savings: number;
  cryptoPrice: number;
  cryptoExtraPct: number;
  urgencyRooms: number;
  isLuxury: boolean;
};

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getOfferPricing(
  basePrice: number,
  offerId: string,
  stars?: number | null
): OfferPricing {
  const h = hashId(offerId);
  const isLuxury = (stars ?? 0) >= 5;

  const discountPct = Math.min(
    60,
    isLuxury ? 45 + (h % 16) : (stars ?? 0) >= 4 ? 35 + (h % 13) : 25 + (h % 16),
  );

  const salePrice = round2(basePrice * (1 - discountPct / 100));
  const markup = isLuxury ? 1.55 : (stars ?? 0) >= 4 ? 1.45 : 1.32;
  const originalPrice = round2(Math.max(basePrice * markup, salePrice * 1.12));
  const savings = round2(originalPrice - salePrice);
  const cryptoExtraPct = 20;
  const cryptoPrice = round2(salePrice * (1 - cryptoExtraPct / 100));
  const urgencyRooms = 2 + (h % 7);

  return {
    salePrice,
    originalPrice,
    discountPct,
    savings,
    cryptoPrice,
    cryptoExtraPct,
    urgencyRooms,
    isLuxury,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function applySalePrice(
  amount: number,
  offerId: string,
  stars?: number | null,
  crypto = false
): number {
  const { discountPct, cryptoExtraPct } = getOfferPricing(amount, offerId, stars);
  let price = amount * (1 - discountPct / 100);
  if (crypto) price *= 1 - cryptoExtraPct / 100;
  return round2(price);
}
