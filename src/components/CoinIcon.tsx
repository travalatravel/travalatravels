import Image from "next/image";

export type CoinId = "btc" | "eth" | "usdc" | "ava";

const COINS: Record<CoinId, { label: string; src: string }> = {
  btc: { label: "Bitcoin", src: "/coins/btc.svg" },
  eth: { label: "Ethereum", src: "/coins/eth.svg" },
  usdc: { label: "USD Coin", src: "/coins/usdc.svg" },
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
