export const CRYPTO_PAYMENT_METHODS = ["CRYPTO_BTC", "CRYPTO_ETH", "CRYPTO_USDC"] as const;
export type CryptoPaymentMethod = (typeof CRYPTO_PAYMENT_METHODS)[number];

export function isCryptoPayment(method: string) {
  return CRYPTO_PAYMENT_METHODS.includes(method as CryptoPaymentMethod);
}

export const CRYPTO_CURRENCY_MAP: Record<CryptoPaymentMethod, string> = {
  CRYPTO_BTC: "BTC",
  CRYPTO_ETH: "ETH",
  CRYPTO_USDC: "USDC",
};

export const CRYPTO_PAYMENT_LABELS: Record<string, string> = {
  CRYPTO_BTC: "Bitcoin",
  CRYPTO_ETH: "Ethereum",
  CRYPTO_USDC: "USD Coin",
};

export const CRYPTO_PAYMENT_SYMBOLS: Record<CryptoPaymentMethod, string> = {
  CRYPTO_BTC: "BTC",
  CRYPTO_ETH: "ETH",
  CRYPTO_USDC: "USDC",
};

export const CRYPTO_PAYMENT_COINS: Record<CryptoPaymentMethod, "btc" | "eth" | "usdc"> = {
  CRYPTO_BTC: "btc",
  CRYPTO_ETH: "eth",
  CRYPTO_USDC: "usdc",
};

export const GATEWAY_NAME = "Travala Secure Payments";
