import Link from "next/link";
import PaymentAcceptLogos from "./PaymentAcceptLogos";
import CoinIcon from "./CoinIcon";
import { CRYPTO_COINS } from "@/data/site-data";

export default function CryptoSection() {
  return (
    <section className="border-t border-gray-200 bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1e2e5e] sm:text-2xl md:text-3xl">
              Book Travel with Cryptocurrency
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              Pay for hotels, flights, car rentals and activities with Bitcoin, Ethereum, AVA
              and 100+ cryptocurrencies. Secure checkout with instant confirmation.
            </p>
            <Link
              href="/search?type=stays"
              className="mt-6 inline-block rounded-lg bg-[#2577be] px-8 py-3 text-sm font-semibold text-white hover:bg-[#1e2e5e]"
            >
              Start booking
            </Link>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Accepted payments
            </p>
            <PaymentAcceptLogos className="mb-6" />
            <div className="flex flex-wrap gap-3">
              {CRYPTO_COINS.map((coin) => (
                <div
                  key={coin}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-2"
                >
                  <CoinIcon coin={coin} size={36} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
