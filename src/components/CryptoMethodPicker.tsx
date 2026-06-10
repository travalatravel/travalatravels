"use client";

import { useState } from "react";
import CoinIcon from "@/components/CoinIcon";
import {
  BASE_CRYPTO_METHODS,
  CRYPTO_PAYMENT_COINS,
  CRYPTO_PAYMENT_SYMBOLS,
  USDT_NETWORK_OPTIONS,
  isUsdtMethod,
  splitPaymentMethod,
  resolvePaymentMethod,
  type BaseCryptoMethod,
  type CryptoPaymentMethod,
  type UsdtNetworkMethod,
} from "@/lib/payments";
import { useTranslations } from "@/i18n/useTranslations";

const BASE_COIN_LABELS: Record<BaseCryptoMethod, string> = {
  CRYPTO_BTC: "Bitcoin",
  CRYPTO_ETH: "Ethereum",
  CRYPTO_USDC: "USD Coin",
  CRYPTO_LTC: "Litecoin",
  CRYPTO_SOL: "Solana",
  CRYPTO_USDT: "Tether",
};

const BASE_COINS: Record<BaseCryptoMethod, "btc" | "eth" | "usdc" | "ltc" | "sol" | "usdt"> = {
  CRYPTO_BTC: "btc",
  CRYPTO_ETH: "eth",
  CRYPTO_USDC: "usdc",
  CRYPTO_LTC: "ltc",
  CRYPTO_SOL: "sol",
  CRYPTO_USDT: "usdt",
};

export default function CryptoMethodPicker({
  value,
  onChange,
  className = "",
}: {
  value: CryptoPaymentMethod;
  onChange: (method: CryptoPaymentMethod) => void;
  className?: string;
}) {
  const { messages: m } = useTranslations();
  const p = m.payments;
  const { base, usdtNetwork } = splitPaymentMethod(value);
  const [usdtOpen, setUsdtOpen] = useState(base === "CRYPTO_USDT" || isUsdtMethod(value));

  const selectBase = (method: BaseCryptoMethod) => {
    if (method === "CRYPTO_USDT") {
      setUsdtOpen(true);
      onChange(resolvePaymentMethod("CRYPTO_USDT", usdtNetwork || "CRYPTO_USDT_TRC20"));
      return;
    }
    setUsdtOpen(false);
    onChange(method);
  };

  const selectUsdtNetwork = (method: UsdtNetworkMethod) => {
    setUsdtOpen(true);
    onChange(method);
  };

  return (
    <div className={className}>
      <div className="grid min-w-0 max-w-full grid-cols-3 gap-2 sm:grid-cols-6">
        {BASE_CRYPTO_METHODS.map((method) => {
          const selected = base === method;
          return (
            <button
              key={method}
              type="button"
              onClick={() => selectBase(method)}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border px-1.5 py-2.5 text-center transition sm:gap-1.5 sm:px-2 sm:py-3 ${
                selected
                  ? "border-[#1a1a1a] bg-slate-50 ring-1 ring-[#1e2e5e]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <CoinIcon coin={BASE_COINS[method]} size={28} />
              <span className="block text-xs font-bold text-[#1a1a1a] sm:text-sm">
                {method === "CRYPTO_USDT" ? "USDT" : CRYPTO_PAYMENT_SYMBOLS[method as CryptoPaymentMethod]}
              </span>
              <span className="block text-[9px] text-slate-500 sm:text-[10px]">
                {BASE_COIN_LABELS[method]}
              </span>
            </button>
          );
        })}
      </div>

      {(usdtOpen || base === "CRYPTO_USDT") && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
          <p className="text-xs font-semibold text-[#1a1a1a]">{p.usdtNetwork}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{p.usdtNetworkHint}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {USDT_NETWORK_OPTIONS.map((opt) => {
              const selected = value === opt.method;
              return (
                <button
                  key={opt.method}
                  type="button"
                  onClick={() => selectUsdtNetwork(opt.method)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition ${
                    selected
                      ? "border-[#1a1a1a] bg-white ring-1 ring-[#1e2e5e]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="relative">
                    <CoinIcon coin="usdt" size={26} />
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm">
                      <CoinIcon coin={opt.chainCoin} size={14} />
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1a1a1a]">{opt.shortLabel}</span>
                  <span className="text-[9px] text-slate-500">{opt.networkLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
