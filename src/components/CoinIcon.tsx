import Image from "next/image";

export type CoinId =
  | "btc"
  | "eth"
  | "usdc"
  | "usdt"
  | "ltc"
  | "sol"
  | "trx"
  | "bnb"
  | "ava";

const COINS: Record<CoinId, { label: string; src: string }> = {
  btc: { label: "Bitcoin", src: "https://static.travala.com/coin-logo/btc.png" },
  eth: { label: "Ethereum", src: "https://static.travala.com/coin-logo/eth.png" },
  usdc: { label: "USD Coin", src: "https://static.travala.com/coin-logo/USDC.png" },
  usdt: { label: "Tether", src: "https://statics.travala.com/coin-logo/USDT3.png" },
  ltc: { label: "Litecoin", src: "https://statics.travala.com/coin-logo/ltc.png" },
  sol: { label: "Solana", src: "https://statics.travala.com/coin-logo/SOL.png" },
  trx: { label: "TRON", src: "https://static.travala.com/coin-logo/trx.png" },
  bnb: { label: "BNB", src: "https://statics.travala.com/coin-logo/bnb-new.png" },
  ava: { label: "AVA", src: "https://statics.travala.com/coin-logo/ava20.png" },
};

export default function CoinIcon({
  coin,
  size = 40,
  className = "",
}: {
  coin: CoinId;
  size?: number;
  className?: string;
}) {
  const { label, src } = COINS[coin];
  return (
    <Image
      src={src}
      alt={label}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      unoptimized
    />
  );
}
