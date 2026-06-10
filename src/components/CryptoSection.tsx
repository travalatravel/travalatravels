import Link from "next/link";
import { CRYPTO_COINS } from "@/data/site-data";
import CoinIcon from "./CoinIcon";

export default function CryptoSection() {
  return (
    <section className="border-t border-gray-200 bg-[#f8fafc] py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-3 text-center sm:px-4 lg:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1e2e5e] sm:text-2xl">
          Book with Crypto &amp; Save
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
          Pay for hotels, flights, car rentals and activities with Bitcoin, Ethereum, AVA and 100+ cryptocurrencies
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {CRYPTO_COINS.map((coin) => (
            <div
              key={coin}
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
            >
              <CoinIcon coin={coin} size={36} />
            </div>
          ))}
        </div>
        <Link
          href="/search?type=stays"
          className="mt-8 inline-block rounded-lg bg-[#2577be] px-8 py-3 text-sm font-semibold text-white hover:bg-[#1e2e5e]"
        >
          Start booking
        </Link>
      </div>
    </section>
  );
}
