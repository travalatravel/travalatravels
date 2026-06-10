/** Live flight offers: 30% below market reference price */
export const FLIGHT_DISCOUNT_PCT = 30;

export type FlightPricing = {
  /** Market price from provider */
  originalPrice: number;
  /** Our price — 30% below market */
  salePrice: number;
  discountPct: number;
  savings: number;
  cryptoPrice: number;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function getFlightPricing(sourcePrice: number): FlightPricing {
  const originalPrice = round2(Math.max(0, sourcePrice));
  const salePrice = round2(originalPrice * (1 - FLIGHT_DISCOUNT_PCT / 100));
  const savings = round2(originalPrice - salePrice);
  return {
    originalPrice,
    salePrice,
    discountPct: FLIGHT_DISCOUNT_PCT,
    savings,
    cryptoPrice: salePrice,
  };
}

export function applyFlightSalePrice(amount: number): number {
  return round2(Math.max(0, amount) * (1 - FLIGHT_DISCOUNT_PCT / 100));
}
