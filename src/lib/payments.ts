export const CRYPTO_PAYMENT_METHODS = [
  "CRYPTO_BTC",
  "CRYPTO_ETH",
  "CRYPTO_USDC",
  "CRYPTO_LTC",
  "CRYPTO_SOL",
  "CRYPTO_USDT_TRC20",
  "CRYPTO_USDT_ERC20",
  "CRYPTO_USDT_BEP20",
] as const;

export type CryptoPaymentMethod = (typeof CRYPTO_PAYMENT_METHODS)[number];

export const BASE_CRYPTO_METHODS = [
  "CRYPTO_BTC",
  "CRYPTO_ETH",
  "CRYPTO_USDC",
  "CRYPTO_LTC",
  "CRYPTO_SOL",
  "CRYPTO_USDT",
] as const;

export type BaseCryptoMethod = (typeof BASE_CRYPTO_METHODS)[number];

export const USDT_NETWORK_METHODS = [
  "CRYPTO_USDT_TRC20",
  "CRYPTO_USDT_ERC20",
  "CRYPTO_USDT_BEP20",
] as const;

export type UsdtNetworkMethod = (typeof USDT_NETWORK_METHODS)[number];

export function isCryptoPayment(method: string) {
  return CRYPTO_PAYMENT_METHODS.includes(method as CryptoPaymentMethod);
}

export function isUsdtMethod(method: CryptoPaymentMethod): method is UsdtNetworkMethod {
  return (USDT_NETWORK_METHODS as readonly string[]).includes(method);
}

export type WalletLookup = {
  currency: string;
  network: string;
};

export const CRYPTO_WALLET_LOOKUP: Record<CryptoPaymentMethod, WalletLookup> = {
  CRYPTO_BTC: { currency: "BTC", network: "Bitcoin" },
  CRYPTO_ETH: { currency: "ETH", network: "Ethereum" },
  CRYPTO_USDC: { currency: "USDC", network: "Ethereum (ERC-20)" },
  CRYPTO_LTC: { currency: "LTC", network: "Litecoin" },
  CRYPTO_SOL: { currency: "SOL", network: "Solana" },
  CRYPTO_USDT_TRC20: { currency: "USDT", network: "TRON (TRC-20)" },
  CRYPTO_USDT_ERC20: { currency: "USDT", network: "Ethereum (ERC-20)" },
  CRYPTO_USDT_BEP20: { currency: "USDT", network: "BNB Chain (BEP-20)" },
};

/** @deprecated use CRYPTO_WALLET_LOOKUP */
export const CRYPTO_CURRENCY_MAP: Record<CryptoPaymentMethod, string> = {
  CRYPTO_BTC: "BTC",
  CRYPTO_ETH: "ETH",
  CRYPTO_USDC: "USDC",
  CRYPTO_LTC: "LTC",
  CRYPTO_SOL: "SOL",
  CRYPTO_USDT_TRC20: "USDT",
  CRYPTO_USDT_ERC20: "USDT",
  CRYPTO_USDT_BEP20: "USDT",
};

export const CRYPTO_PAYMENT_LABELS: Record<CryptoPaymentMethod, string> = {
  CRYPTO_BTC: "Bitcoin",
  CRYPTO_ETH: "Ethereum",
  CRYPTO_USDC: "USD Coin",
  CRYPTO_LTC: "Litecoin",
  CRYPTO_SOL: "Solana",
  CRYPTO_USDT_TRC20: "USDT · TRON",
  CRYPTO_USDT_ERC20: "USDT · Ethereum",
  CRYPTO_USDT_BEP20: "USDT · BNB Chain",
};

export const CRYPTO_PAYMENT_SYMBOLS: Record<CryptoPaymentMethod, string> = {
  CRYPTO_BTC: "BTC",
  CRYPTO_ETH: "ETH",
  CRYPTO_USDC: "USDC",
  CRYPTO_LTC: "LTC",
  CRYPTO_SOL: "SOL",
  CRYPTO_USDT_TRC20: "USDT",
  CRYPTO_USDT_ERC20: "USDT",
  CRYPTO_USDT_BEP20: "USDT",
};

export const CRYPTO_PAYMENT_COINS: Record<
  CryptoPaymentMethod,
  "btc" | "eth" | "usdc" | "ltc" | "sol" | "usdt"
> = {
  CRYPTO_BTC: "btc",
  CRYPTO_ETH: "eth",
  CRYPTO_USDC: "usdc",
  CRYPTO_LTC: "ltc",
  CRYPTO_SOL: "sol",
  CRYPTO_USDT_TRC20: "usdt",
  CRYPTO_USDT_ERC20: "usdt",
  CRYPTO_USDT_BEP20: "usdt",
};

export const USDT_NETWORK_OPTIONS: {
  method: UsdtNetworkMethod;
  chainCoin: "trx" | "eth" | "bnb";
  shortLabel: string;
  networkLabel: string;
}[] = [
  { method: "CRYPTO_USDT_TRC20", chainCoin: "trx", shortLabel: "TRC-20", networkLabel: "TRON" },
  { method: "CRYPTO_USDT_ERC20", chainCoin: "eth", shortLabel: "ERC-20", networkLabel: "Ethereum" },
  { method: "CRYPTO_USDT_BEP20", chainCoin: "bnb", shortLabel: "BEP-20", networkLabel: "BNB Chain" },
];

export function resolvePaymentMethod(
  base: BaseCryptoMethod,
  usdtNetwork?: UsdtNetworkMethod,
): CryptoPaymentMethod {
  if (base === "CRYPTO_USDT") {
    return usdtNetwork || "CRYPTO_USDT_TRC20";
  }
  return base;
}

export function splitPaymentMethod(method: CryptoPaymentMethod): {
  base: BaseCryptoMethod;
  usdtNetwork?: UsdtNetworkMethod;
} {
  if (isUsdtMethod(method)) {
    return { base: "CRYPTO_USDT", usdtNetwork: method };
  }
  return { base: method as BaseCryptoMethod };
}

export const GATEWAY_NAME = "Travala Secure Payments";
