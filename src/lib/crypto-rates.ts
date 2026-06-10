export type CryptoQuote = {
  currency: string;
  usdTotal: number;
  cryptoAmount: number;
  rate: number;
  updatedAt: string;
};

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  LTC: "litecoin",
  SOL: "solana",
};

export async function getCryptoQuote(
  currency: string,
  usdTotal: number
): Promise<CryptoQuote> {
  const normalized = currency.toUpperCase();

  if (normalized === "USDC" || normalized === "USDT") {
    return {
      currency: normalized,
      usdTotal,
      cryptoAmount: usdTotal,
      rate: 1,
      updatedAt: new Date().toISOString(),
    };
  }

  const coinId = COINGECKO_IDS[normalized];
  if (!coinId) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    throw new Error("Rate lookup failed");
  }

  const data = (await res.json()) as Record<string, { usd: number }>;
  const rate = data[coinId]?.usd;
  if (!rate || rate <= 0) {
    throw new Error("Invalid rate");
  }

  const cryptoAmount = usdTotal / rate;

  return {
    currency: normalized,
    usdTotal,
    cryptoAmount,
    rate,
    updatedAt: new Date().toISOString(),
  };
}

export function formatCryptoAmount(currency: string, amount: number): string {
  if (currency === "BTC") return amount.toFixed(8);
  if (currency === "ETH") return amount.toFixed(6);
  if (currency === "LTC") return amount.toFixed(6);
  if (currency === "SOL") return amount.toFixed(4);
  return amount.toFixed(2);
}

export function explorerTxUrl(currency: string, txHash: string, network?: string): string | null {
  const hash = txHash.trim();
  if (!hash) return null;
  if (currency === "BTC") return `https://mempool.space/tx/${hash}`;
  if (currency === "ETH" || currency === "USDC") return `https://etherscan.io/tx/${hash}`;
  if (currency === "LTC") return `https://blockchair.com/litecoin/transaction/${hash}`;
  if (currency === "SOL") return `https://solscan.io/tx/${hash}`;
  if (currency === "USDT") {
    if (network?.includes("TRON")) return `https://tronscan.org/#/transaction/${hash}`;
    if (network?.includes("BNB")) return `https://bscscan.com/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
  }
  return null;
}
