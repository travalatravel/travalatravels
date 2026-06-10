import Link from "next/link";
import { CRYPTO_COINS } from "@/data/site-data";
import CoinIcon from "./CoinIcon";
import { Bitcoin } from "lucide-react";

export default function CryptoSection() {
  return (
    <section className="bg-[#0f172a] py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-400">
              <Bitcoin size={16} />
              Pay less with crypto
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
              An extra 20% off
              <br />
              <span className="text-amber-400">every single booking</span>
            </h2>
            <p className="mt-4 max-w-lg text-white/70">
              Luxury shouldn&apos;t cost more at checkout. Pay with Bitcoin, Ethereum or
              USDC and your total drops by an extra 20% — on top of flash-sale
              discounts up to 62%.
            </p>
            <Link
              href="/search?type=stays"
              className="mt-6 inline-block rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-amber-400"
            >
              Browse luxury deals →
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4 lg:justify-end">
            {CRYPTO_COINS.map((coin) => (
              <div
                key={coin}
                className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur"
              >
                <CoinIcon coin={coin} size={40} />
              </div>
            ))}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-sm font-bold text-amber-400">
              +20%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
