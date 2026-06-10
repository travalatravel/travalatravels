/** Fixed discount vs travala.com list price */
export const TRAVALA_DISCOUNT_PCT = 40;

export type OfferPricing = {
  /** travala.com price (reference) */
  originalPrice: number;
  /** Our price — 40% below travala.com */
  salePrice: number;
  discountPct: number;
  savings: number;
  /** Same as salePrice — crypto pays the discounted rate, no extra markdown */
  cryptoPrice: number;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** `basePrice` must be the travala.com price (per night or total). */
export function getOfferPricing(
  basePrice: number,
  _offerId?: string,
  _stars?: number | null,
): OfferPricing {
  const originalPrice = round2(Math.max(0, basePrice));
  const salePrice = round2(originalPrice * (1 - TRAVALA_DISCOUNT_PCT / 100));
  const savings = round2(originalPrice - salePrice);

  return {
    originalPrice,
    salePrice,
    discountPct: TRAVALA_DISCOUNT_PCT,
    savings,
    cryptoPrice: salePrice,
  };
}

export function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`;
}

/** Apply the fixed 40% travala.com discount to a travala list amount. */
export function applySalePrice(
  amount: number,
  _offerId?: string,
  _stars?: number | null,
  _crypto?: boolean,
): number {
  return round2(Math.max(0, amount) * (1 - TRAVALA_DISCOUNT_PCT / 100));
}
