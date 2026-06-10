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
  btc: { label: "Bitcoin", src: "/coins/btc.svg" },
  eth: { label: "Ethereum", src: "/coins/eth.svg" },
  usdc: { label: "USD Coin", src: "/coins/usdc.svg" },
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
