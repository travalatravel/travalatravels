"use client";

import CoinIcon from "@/components/CoinIcon";
import {
  CRYPTO_PAYMENT_COINS,
  CRYPTO_PAYMENT_LABELS,
  CRYPTO_PAYMENT_METHODS,
  CRYPTO_PAYMENT_SYMBOLS,
  type CryptoPaymentMethod,
} from "@/lib/payments";

export default function CryptoMethodPicker({
  value,
  onChange,
  className = "",
}: {
  value: CryptoPaymentMethod;
  onChange: (method: CryptoPaymentMethod) => void;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {CRYPTO_PAYMENT_METHODS.map((method) => {
        const selected = value === method;
        return (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition ${
              selected
                ? "border-[#1e2e5e] bg-slate-50 ring-1 ring-[#1e2e5e]"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <CoinIcon coin={CRYPTO_PAYMENT_COINS[method]} size={28} />
            <span className="block text-sm font-bold text-[#1e2e5e]">
              {CRYPTO_PAYMENT_SYMBOLS[method]}
            </span>
            <span className="block text-[10px] text-slate-500">
              {CRYPTO_PAYMENT_LABELS[method]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
