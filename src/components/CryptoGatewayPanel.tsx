"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Lock,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { Booking } from "@/lib/types";
import { PAYMENT_STATUS_COLORS } from "@/lib/types";
import { GATEWAY_NAME } from "@/lib/payments";
import { useTranslations } from "@/i18n/useTranslations";
import type { CryptoQuote } from "@/lib/crypto-rates";
import CoinIcon, { type CoinId } from "@/components/CoinIcon";

const CURRENCY_COIN: Record<string, CoinId> = {
  BTC: "btc",
  ETH: "eth",
  USDC: "usdc",
  USDT: "usdt",
  LTC: "ltc",
  SOL: "sol",
};

function CopyField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-1.5 flex items-stretch gap-2">
        <div
          className={`flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 ${mono ? "font-mono text-xs break-all" : "font-medium"}`}
        >
          {value}
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

function StepIndicator({ step, current }: { step: number; current: number }) {
  const done = current > step;
  const active = current === step;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
          done
            ? "bg-emerald-600 text-white"
            : active
              ? "bg-[#1e2e5e] text-white"
              : "bg-slate-100 text-slate-400"
        }`}
      >
        {done ? <Check size={14} /> : step}
      </div>
    </div>
  );
}

export default function CryptoGatewayPanel({
  booking,
  onPaid,
  bundleBookingId,
  bundleTotal,
}: {
  booking: Booking;
  onPaid: () => void;
  bundleBookingId?: string;
  bundleTotal?: number;
}) {
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<CryptoQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const { messages: m, fmt } = useTranslations();
  const p = m.paymentPage;

  const wallet = booking.wallet;
  const step =
    booking.paymentStatus === "PAID"
      ? 4
      : booking.paymentStatus === "AWAITING_CONFIRMATION"
        ? 3
        : 2;

  const payUsd = bundleTotal ?? booking.totalPrice;

  useEffect(() => {
    if (!wallet) return;
    setQuoteLoading(true);
    fetch(`/api/crypto/quote?currency=${wallet.currency}&usd=${payUsd}`)
      .then((r) => r.json())
      .then((data) => setQuote(data.quote ?? null))
      .catch(() => setQuote(null))
      .finally(() => setQuoteLoading(false));
  }, [wallet, payUsd]);

  const submitTx = async () => {
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/bookings/${booking.id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txHash: txHash.trim(),
        bundleBookingId: bundleBookingId || undefined,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || p.submissionFailed);
      return;
    }
    onPaid();
  };

  if (!wallet) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <AlertCircle className="mx-auto text-amber-600" size={28} />
        <p className="mt-3 font-semibold text-amber-900">Payment wallet not configured</p>
        <p className="mt-1 text-sm text-amber-700">Please contact support to complete this booking.</p>
      </div>
    );
  }

  const cryptoAmount = quote
    ? wallet.currency === "BTC"
      ? quote.cryptoAmount.toFixed(8)
      : wallet.currency === "ETH"
        ? quote.cryptoAmount.toFixed(6)
        : wallet.currency === "LTC"
          ? quote.cryptoAmount.toFixed(6)
          : wallet.currency === "SOL"
            ? quote.cryptoAmount.toFixed(4)
            : quote.cryptoAmount.toFixed(2)
    : null;

  const qrData =
    wallet.currency === "BTC" && cryptoAmount
      ? `bitcoin:${wallet.address}?amount=${cryptoAmount}`
      : wallet.address;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(qrData)}`;

  const explorerUrl =
    booking.txHash && booking.paymentStatus !== "PENDING"
      ? wallet.currency === "BTC"
        ? `https://mempool.space/tx/${booking.txHash}`
        : `https://etherscan.io/tx/${booking.txHash}`
      : null;

  if (booking.paymentStatus === "PAID") {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <ShieldCheck className="text-emerald-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{p.paymentConfirmed}</h2>
              <p className="text-sm text-slate-500">{p.reservationSecured}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">{p.reference}</p>
              <p className="mt-0.5 font-mono text-sm font-medium text-slate-800">
                {booking.id.slice(0, 12).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">{p.amountPaid}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                ${payUsd.toFixed(2)} USD
              </p>
            </div>
          </div>
          {booking.paidAt && (
            <p className="text-sm text-slate-500">
              {fmt(p.confirmedAt, { date: new Date(booking.paidAt).toLocaleString() })}
            </p>
          )}
          {booking.txHash && explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2D83C2] hover:underline"
            >
              {p.viewExplorer}
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-500">
              <Lock size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">
                {GATEWAY_NAME}
              </span>
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              {p.cryptoPayment}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-slate-400">
              REF {booking.id.slice(0, 12).toUpperCase()}
            </p>
          </div>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_COLORS[booking.paymentStatus]}`}
          >
            {m.paymentStatus[booking.paymentStatus]}
          </span>
        </div>

        {/* Steps */}
        <div className="mt-5 flex items-center gap-3">
          <StepIndicator step={1} current={step} />
          <div className={`h-px flex-1 ${step > 1 ? "bg-emerald-300" : "bg-slate-200"}`} />
          <StepIndicator step={2} current={step} />
          <div className={`h-px flex-1 ${step > 2 ? "bg-emerald-300" : "bg-slate-200"}`} />
          <StepIndicator step={3} current={step} />
          <span className="ml-1 hidden text-xs text-slate-400 sm:inline">
            {step === 2 ? p.stepSend : step === 3 ? p.stepVerification : p.stepComplete}
          </span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-5">
        {/* Order summary */}
        <div className="border-b border-slate-100 bg-slate-50/80 p-6 lg:col-span-2 lg:border-b-0 lg:border-r">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Order summary
          </p>
          <h3 className="mt-2 font-semibold text-slate-900 leading-snug">
            {booking.offer.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{booking.offer.location}</p>

          <div className="mt-6 space-y-3 border-t border-slate-200/80 pt-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">{p.paymentMethod}</span>
              <span className="flex items-center gap-2 font-medium text-slate-800">
                {CURRENCY_COIN[wallet.currency] && (
                  <CoinIcon coin={CURRENCY_COIN[wallet.currency]} size={20} />
                )}
                {wallet.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{p.network}</span>
              <span className="font-medium text-slate-800">{wallet.network}</span>
            </div>
            {booking.checkIn && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{p.checkIn}</span>
                <span className="font-medium text-slate-800">
                  {new Date(booking.checkIn).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">{p.totalDue}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              ${payUsd.toFixed(2)}
              <span className="ml-1 text-base font-normal text-slate-400">USD</span>
            </p>
            {cryptoAmount && !quoteLoading && (
              <p className="mt-2 text-sm text-slate-600">
                ≈ <span className="font-mono font-semibold">{cryptoAmount}</span>{" "}
                {wallet.currency}
              </p>
            )}
            {quoteLoading && (
              <p className="mt-2 text-sm text-slate-400">{p.calculatingRate}</p>
            )}
          </div>
        </div>

        {/* Payment instructions */}
        <div className="p-4 sm:p-6 lg:col-span-3">
          {booking.paymentStatus === "AWAITING_CONFIRMATION" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <Clock className="text-[#2D83C2]" size={28} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {p.awaitingConfirmation}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                {p.awaitingHint}
              </p>
              {booking.txHash && (
                <div className="mt-5 w-full max-w-md text-left">
                  <CopyField label={p.txHash} value={booking.txHash} mono />
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#2D83C2] hover:underline"
                    >
                      {p.trackExplorer}
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={onPaid}
                className="mt-6 text-sm font-medium text-[#2D83C2] hover:underline"
              >
                Refresh status
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5">
                <div className="mx-auto flex w-full max-w-[220px] flex-col items-center sm:max-w-none sm:flex-row sm:items-start sm:gap-6">
                  <div className="flex flex-col items-center sm:shrink-0">
                    <div className="rounded-xl border border-slate-200 bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrUrl}
                        alt={p.qrAlt}
                        width={200}
                        height={200}
                        className="h-auto w-full max-w-[200px] rounded-lg"
                      />
                    </div>
                    <p className="mt-2 text-center text-[11px] text-slate-400">{p.scanQr}</p>
                  </div>

                  <div className="w-full flex-1 space-y-4">
                    {cryptoAmount && (
                      <CopyField
                        label={fmt(p.amountLabel, { currency: wallet.currency })}
                        value={`${cryptoAmount} ${wallet.currency}`}
                        mono
                      />
                    )}
                    <CopyField label={p.depositAddress} value={wallet.address} mono />
                    <CopyField label={p.network} value={wallet.network} />
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-3 sm:px-4">
                <p className="text-xs leading-relaxed text-amber-900/80">
                  <strong className="font-semibold">{p.important}</strong>{" "}
                  {fmt(p.importantHint, { currency: wallet.currency, network: wallet.network })}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <label
                  htmlFor={`tx-${booking.id}`}
                  className="text-[11px] font-medium uppercase tracking-wider text-slate-400"
                >
                  {p.step3Confirm}
                </label>
                <p className="mt-1 text-sm text-slate-500">{p.pasteTxHint}</p>
                <input
                  id={`tx-${booking.id}`}
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder={
                    wallet.currency === "BTC" ? p.txPlaceholderBtc : p.txPlaceholderEth
                  }
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#1e2e5e] focus:ring-2 focus:ring-[#1e2e5e]/10"
                />
                {error && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle size={14} />
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={submitTx}
                  disabled={submitting || txHash.trim().length < 10}
                  className="mt-4 w-full rounded-lg bg-[#1e2e5e] py-3.5 text-sm font-semibold text-white transition hover:bg-[#162347] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? p.submitting : p.submitConfirmation}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3">
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
          <ShieldCheck size={12} />
          {p.footerSecure}
        </p>
      </div>
    </div>
  );
}
