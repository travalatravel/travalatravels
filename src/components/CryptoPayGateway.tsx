"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  HelpCircle,
  Hexagon,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import type { Booking } from "@/lib/types";
import {
  CRYPTO_PAYMENT_COINS,
  type CryptoPaymentMethod,
} from "@/lib/payments";
import { useTranslations } from "@/i18n/useTranslations";
import type { CryptoQuote } from "@/lib/crypto-rates";
import CoinIcon, { type CoinId } from "@/components/CoinIcon";

const PAYMENT_WINDOW_SECONDS = 15 * 60;

const COIN_OPTIONS: {
  method: CryptoPaymentMethod;
  coin: CoinId;
  name: string;
  sub: string;
}[] = [
  { method: "CRYPTO_BTC", coin: "btc", name: "Bitcoin", sub: "BTC" },
  { method: "CRYPTO_ETH", coin: "eth", name: "Ethereum", sub: "ETH" },
  { method: "CRYPTO_USDT_TRC20", coin: "usdt", name: "USDT", sub: "TRC20" },
  { method: "CRYPTO_USDC", coin: "usdc", name: "USD Coin", sub: "USDC" },
  { method: "CRYPTO_LTC", coin: "ltc", name: "Litecoin", sub: "LTC" },
  { method: "CRYPTO_SOL", coin: "sol", name: "Solana", sub: "SOL" },
];

function formatCountdown(totalSeconds: number) {
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function formatCryptoAmount(amount: number, currency: string) {
  switch (currency) {
    case "BTC":
      return amount.toFixed(8);
    case "ETH":
    case "LTC":
      return amount.toFixed(6);
    case "SOL":
      return amount.toFixed(4);
    default:
      return amount.toFixed(2);
  }
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/10 hover:text-white"
    >
      {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
    </button>
  );
}

function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-xl bg-blue-500/15"
      style={{ width: size, height: size }}
    >
      <Hexagon size={size * 0.62} className="fill-blue-500 text-blue-400" />
    </span>
  );
}

export default function CryptoPayGateway({
  booking,
  onPaid,
  onBookingChange,
  bundleBookingId,
  bundleTotal,
  accessToken,
}: {
  booking: Booking;
  onPaid: () => void;
  onBookingChange: (booking: Booking) => void;
  bundleBookingId?: string;
  bundleTotal?: number;
  accessToken?: string;
}) {
  const router = useRouter();
  const { locale, messages: m, fmt } = useTranslations();
  const p = m.paymentPage;

  const [quote, setQuote] = useState<CryptoQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteTick, setQuoteTick] = useState(0);
  const [countdown, setCountdown] = useState(PAYMENT_WINDOW_SECONDS);
  const [coinOpen, setCoinOpen] = useState(false);
  const [switching, setSwitching] = useState<CryptoPaymentMethod | null>(null);
  const [switchError, setSwitchError] = useState("");
  const [paidUi, setPaidUi] = useState<"idle" | "verifying" | "done">("idle");
  const [payError, setPayError] = useState("");

  const wallet = booking.wallet;
  const payUsd = bundleTotal ?? booking.totalPrice;
  const pending = booking.paymentStatus === "PENDING";

  const selectedOption = useMemo(() => {
    const method = booking.paymentMethod as CryptoPaymentMethod;
    return (
      COIN_OPTIONS.find((o) => o.method === method) ||
      COIN_OPTIONS.find(
        (o) => CRYPTO_PAYMENT_COINS[o.method] === CRYPTO_PAYMENT_COINS[method],
      ) ||
      COIN_OPTIONS[0]
    );
  }, [booking.paymentMethod]);

  useEffect(() => {
    if (!wallet) return;
    setQuoteLoading(true);
    fetch(`/api/crypto/quote?currency=${wallet.currency}&usd=${payUsd}`)
      .then((r) => r.json())
      .then((data) => setQuote(data.quote ?? null))
      .catch(() => setQuote(null))
      .finally(() => setQuoteLoading(false));
  }, [wallet, payUsd, quoteTick]);

  // 15-minute payment window — when it elapses, refresh the rate and restart
  useEffect(() => {
    if (!pending) return;
    const interval = setInterval(() => {
      setCountdown((s) => {
        if (s <= 1) {
          setQuoteTick((t) => t + 1);
          return PAYMENT_WINDOW_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pending]);

  const cryptoAmount =
    quote && wallet ? formatCryptoAmount(quote.cryptoAmount, wallet.currency) : null;

  const qrData = wallet
    ? wallet.currency === "BTC" && cryptoAmount
      ? `bitcoin:${wallet.address}?amount=${cryptoAmount}`
      : wallet.address
    : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(qrData)}`;

  const explorerUrl =
    booking.txHash && wallet
      ? wallet.currency === "BTC"
        ? `https://mempool.space/tx/${booking.txHash}`
        : `https://etherscan.io/tx/${booking.txHash}`
      : null;

  const switchCoin = async (method: CryptoPaymentMethod) => {
    if (!pending || switching) return;
    if (method === booking.paymentMethod) {
      setCoinOpen(false);
      return;
    }
    setSwitchError("");
    setSwitching(method);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          access: accessToken || undefined,
          bundleId: bundleBookingId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.booking) {
        setSwitchError(data.error || p.gwMethodChangeFailed);
        return;
      }
      onBookingChange(data.booking as Booking);
      setCountdown(PAYMENT_WINDOW_SECONDS);
    } catch {
      setSwitchError(p.gwMethodChangeFailed);
    } finally {
      setSwitching(null);
      setCoinOpen(false);
    }
  };

  const handlePaid = async () => {
    setPayError("");
    setPaidUi("verifying");
    await new Promise((r) => setTimeout(r, 2800));
    try {
      const res = await fetch(`/api/bookings/${booking.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundleBookingId: bundleBookingId || undefined,
          access: accessToken || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || p.submissionFailed);
        setPaidUi("idle");
        return;
      }
      setPaidUi("done");
      onPaid();
    } catch {
      setPayError(p.submissionFailed);
      setPaidUi("idle");
    }
  };

  const orderRef = `#${booking.id.slice(0, 8).toUpperCase()}`;
  const createdAt = booking.createdAt
    ? new Date(booking.createdAt).toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  /* ----- shared blocks ----- */

  const countdownPill = (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-sm font-semibold text-emerald-400">
      <Clock size={13} />
      {formatCountdown(countdown)}
    </span>
  );

  const statusPanel =
    booking.paymentStatus === "PAID" ? (
      <div className="rounded-2xl border border-white/[0.07] bg-[#10182b] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <ShieldCheck className="text-emerald-400" size={30} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">{p.paymentConfirmed}</h2>
        <p className="mt-1.5 text-sm text-slate-400">{p.reservationSecured}</p>
        <div className="mx-auto mt-6 grid max-w-sm gap-3 text-left sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-[11px] text-slate-500">{p.reference}</p>
            <p className="mt-0.5 font-mono text-sm text-white">{orderRef}</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-[11px] text-slate-500">{p.amountPaid}</p>
            <p className="mt-0.5 text-sm font-semibold text-white">${payUsd.toFixed(2)} USD</p>
          </div>
        </div>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:underline"
          >
            {p.viewExplorer}
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    ) : booking.paymentStatus === "AWAITING_CONFIRMATION" ? (
      <div className="rounded-2xl border border-white/[0.07] bg-[#10182b] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15">
          <Clock className="text-blue-400" size={30} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">{p.awaitingConfirmation}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">{p.awaitingHint}</p>
        {booking.txHash && (
          <div className="mx-auto mt-5 flex max-w-md items-center gap-2">
            <div className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left font-mono text-xs text-slate-300 break-all">
              {booking.txHash}
            </div>
            <CopyButton value={booking.txHash} label={p.txHash} />
          </div>
        )}
        <button
          type="button"
          onClick={onPaid}
          className="mt-6 text-sm font-medium text-blue-400 hover:underline"
        >
          {p.refreshStatus}
        </button>
      </div>
    ) : null;

  const importantBanner = wallet && (
    <div className="flex gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/[0.08] px-4 py-3">
      <Info size={16} className="mt-0.5 shrink-0 text-blue-400" />
      <div className="text-xs leading-relaxed">
        <p className="font-semibold text-blue-300">
          {fmt(p.gwImportantOnly, { currency: wallet.currency })}
        </p>
        <p className="mt-0.5 text-slate-400">{p.gwImportantLoss}</p>
      </div>
    </div>
  );

  const paidButton = (
    <div>
      {payError && (
        <p className="mb-2 text-sm text-red-400">{payError}</p>
      )}
      {switchError && (
        <p className="mb-2 text-sm text-red-400">{switchError}</p>
      )}
      <button
        type="button"
        onClick={handlePaid}
        disabled={paidUi !== "idle"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-50"
      >
        <Lock size={15} />
        {p.gwIHavePaid}
      </button>
    </div>
  );

  /* ----- render ----- */

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e17] text-white">
      {/* Desktop header */}
      <header className="hidden lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <BrandMark size={34} />
            <span className="text-lg font-bold tracking-tight">
              Travala<span className="text-blue-400">Pay</span>
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
            <Lock size={14} />
            {p.gwSecurePayment}
          </span>
        </div>
      </header>

      {/* Mobile header */}
      <header className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={p.gwBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold">{p.gwTitle}</h1>
            <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck size={11} />
              {p.gwTagline}
            </p>
          </div>
          <span className="flex h-9 items-center gap-1 rounded-full bg-white/[0.06] px-3 text-xs font-semibold uppercase text-slate-300">
            <Globe size={13} />
            {locale}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 lg:px-6">
        {statusPanel ? (
          <div className="mx-auto mt-4 max-w-xl lg:mt-10">{statusPanel}</div>
        ) : !wallet ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
            <p className="font-semibold text-amber-300">{p.walletNotConfigured}</p>
            <p className="mt-1 text-sm text-amber-200/70">{p.contactSupport}</p>
          </div>
        ) : (
          <>
            {/* ============ MOBILE ============ */}
            <div className="space-y-4 lg:hidden">
              {/* Merchant card */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#10182b] px-4 py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/15">
                  <Hexagon size={26} className="fill-blue-500 text-blue-400" />
                </div>
                <p className="mt-3 text-xs text-slate-400">{p.gwPaymentTo}</p>
                <p className="mt-1 text-lg font-bold">{booking.offer.title}</p>
                <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  {p.gwOrderNumber}: {orderRef}
                  <CopyButtonInlineSmall value={orderRef} />
                </p>
              </div>

              {/* 1. Coin */}
              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">{p.gwStepCoin}</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCoinOpen((v) => !v)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#10182b] px-4 py-3 text-left"
                  >
                    <CoinIcon coin={selectedOption.coin} size={26} />
                    <span className="flex-1 text-sm font-semibold">
                      {selectedOption.name} ({selectedOption.sub})
                    </span>
                    {switching ? (
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    ) : (
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition ${coinOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {coinOpen && (
                    <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-white/10 bg-[#131c33] shadow-2xl">
                      {COIN_OPTIONS.map((opt) => (
                        <button
                          key={opt.method}
                          type="button"
                          onClick={() => switchCoin(opt.method)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/[0.06] ${
                            opt.method === selectedOption.method ? "bg-white/[0.04]" : ""
                          }`}
                        >
                          <CoinIcon coin={opt.coin} size={24} />
                          <span className="flex-1 font-medium">{opt.name}</span>
                          <span className="text-xs text-slate-400">{opt.sub}</span>
                          {opt.method === selectedOption.method && (
                            <Check size={15} className="text-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Address */}
              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">{p.gwStepAddress}</p>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#10182b] px-4 py-3.5 font-mono text-xs text-slate-200 break-all">
                    {wallet.address}
                  </div>
                  <CopyButton value={wallet.address} label={p.depositAddress} />
                </div>
              </div>

              {/* 3. Amount */}
              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">{p.gwStepAmount}</p>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#10182b] px-4 py-3.5">
                    {quoteLoading || !cryptoAmount ? (
                      <p className="text-sm text-slate-400">{p.calculatingRate}</p>
                    ) : (
                      <>
                        <p className="text-xl font-bold tracking-tight">
                          {cryptoAmount} {wallet.currency}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          ≈ {payUsd.toFixed(2)} USD
                        </p>
                      </>
                    )}
                  </div>
                  {cryptoAmount && (
                    <CopyButton value={cryptoAmount} label={p.gwAmount} />
                  )}
                </div>
              </div>

              {/* Countdown */}
              <div className="rounded-xl border border-blue-500/25 bg-blue-500/[0.08] px-4 py-4 text-center">
                <p className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                  <Clock size={13} />
                  {p.gwPayWithin}
                </p>
                <p className="mt-1 font-mono text-3xl font-bold text-blue-400">
                  {formatCountdown(countdown)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{p.gwMinutes}</p>
              </div>

              {/* QR */}
              <div className="rounded-2xl bg-white p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt={p.qrAlt}
                  width={240}
                  height={240}
                  className="mx-auto h-auto w-full max-w-[240px]"
                />
                <p className="mt-3 text-center text-xs text-slate-500">{p.gwScanQrOrSend}</p>
              </div>

              {importantBanner}

              {/* Secure note */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#10182b] px-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <ShieldCheck size={19} className="text-emerald-400" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{p.gwSecureTitle}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{p.gwSecureNote}</p>
                </div>
              </div>

              {paidButton}

              {/* Footer bar */}
              <div className="flex items-center justify-between border-t border-white/[0.07] pt-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock size={11} />
                  {p.gwSslEncrypted}
                </span>
                <span className="flex items-center gap-1.5">
                  {p.gwNoExtraFees}
                  <Check size={12} className="text-emerald-400" />
                </span>
              </div>
            </div>

            {/* ============ DESKTOP ============ */}
            <div className="hidden gap-6 lg:grid lg:grid-cols-[340px,1fr]">
              {/* Left: order card */}
              <div className="flex flex-col rounded-2xl border border-white/[0.07] bg-[#10182b] p-6">
                <p className="text-xs text-slate-400">{p.gwPaymentTo}</p>
                <div className="mt-3 flex items-center gap-3">
                  <BrandMark size={42} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{booking.offer.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {p.gwOrderNumber}: {orderRef}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/[0.07] pt-5">
                  <p className="text-xs text-slate-400">{p.gwAmount}</p>
                  <p className="mt-1.5 text-3xl font-bold tracking-tight">
                    {payUsd.toFixed(2)}{" "}
                    <span className="text-base font-medium text-slate-400">USD</span>
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-300">
                      {quoteLoading || !cryptoAmount ? (
                        <span className="text-slate-500">{p.calculatingRate}</span>
                      ) : (
                        <>
                          ≈ <span className="font-mono">{cryptoAmount}</span> {wallet.currency}
                        </>
                      )}
                    </p>
                    {countdownPill}
                  </div>
                </div>

                <div className="mt-6 border-t border-white/[0.07] pt-5">
                  <p className="text-xs text-slate-400">{p.gwDetails}</p>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-400">{p.gwOrderNumber}</dt>
                      <dd className="font-mono font-medium">{orderRef}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-400">{p.gwCreatedAt}</dt>
                      <dd className="font-medium">{createdAt}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-400">{p.paymentMethod}</dt>
                      <dd className="font-medium">{p.gwMethodCrypto}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-auto pt-6">
                  <div className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold">{p.gwReliableTitle}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {p.gwReliableNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: payment card */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#10182b] p-7">
                <h2 className="text-lg font-bold">{p.gwPayWithCrypto}</h2>
                <p className="mt-1 text-sm text-slate-400">{p.gwPayWithCryptoSub}</p>

                {/* Coin row */}
                <p className="mt-6 text-xs font-medium text-slate-400">{p.gwSelectCoin}</p>
                <div className="mt-2.5 grid grid-cols-3 gap-2.5 xl:grid-cols-6">
                  {COIN_OPTIONS.map((opt) => {
                    const active = opt.method === selectedOption.method;
                    return (
                      <button
                        key={opt.method}
                        type="button"
                        onClick={() => switchCoin(opt.method)}
                        disabled={Boolean(switching)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition disabled:opacity-60 ${
                          active
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25"
                        }`}
                      >
                        {switching === opt.method ? (
                          <Loader2 size={26} className="animate-spin text-slate-400" />
                        ) : (
                          <CoinIcon coin={opt.coin} size={26} />
                        )}
                        <span className="text-xs font-semibold leading-tight">{opt.name}</span>
                        <span className="text-[10px] text-slate-400">{opt.sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Payment details */}
                <p className="mt-7 text-xs font-medium text-slate-400">{p.gwPaymentDetails}</p>
                <div className="mt-2.5 divide-y divide-white/[0.06] rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="w-28 shrink-0 text-sm text-slate-400">{p.gwAmount}</span>
                    <span className="min-w-0 flex-1 text-right font-mono text-sm">
                      {quoteLoading || !cryptoAmount
                        ? "…"
                        : `${cryptoAmount} ${wallet.currency}`}
                    </span>
                    {cryptoAmount && <CopyButton value={cryptoAmount} label={p.gwAmount} />}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="w-28 shrink-0 text-sm text-slate-400">
                      {p.gwWalletAddress}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-right font-mono text-sm">
                      {wallet.address}
                    </span>
                    <CopyButton value={wallet.address} label={p.depositAddress} />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="w-28 shrink-0 text-sm text-slate-400">{p.network}</span>
                    <span className="min-w-0 flex-1 text-right text-sm font-medium">
                      {wallet.network}
                    </span>
                    <CopyButton value={wallet.network} label={p.network} />
                  </div>
                </div>

                {/* QR + hint */}
                <div className="mt-7 flex items-start gap-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{p.gwScanQrTitle}</p>
                    <p className="mt-1 text-sm text-slate-400">{p.gwScanQrDesc}</p>
                    <div className="mt-5">{importantBanner}</div>
                    <div className="mt-5">{paidButton}</div>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl}
                      alt={p.qrAlt}
                      width={180}
                      height={180}
                      className="h-[180px] w-[180px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Desktop footer */}
      <footer className="hidden border-t border-white/[0.06] lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} TravalaPay. {p.gwRights}
          </span>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Globe size={13} />
              {locale.toUpperCase()}
            </span>
            <a href="/support" className="flex items-center gap-1.5 hover:text-slate-300">
              <HelpCircle size={13} />
              {p.gwHelp}
            </a>
          </div>
        </div>
      </footer>

      {/* Verifying / done modal */}
      {(paidUi === "verifying" || paidUi === "done") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#131c33] p-8 text-center shadow-2xl">
            {paidUi === "verifying" ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-400" />
                <p className="mt-4 text-lg font-semibold text-white">{p.verifyingPayment}</p>
                <p className="mt-2 text-sm text-slate-400">{p.verifyingHint}</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="h-8 w-8 text-emerald-400" strokeWidth={3} />
                </div>
                <p className="mt-5 text-xl font-bold text-white">{p.thankYouBooking}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {p.emailConfirmationNote}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CopyButtonInlineSmall({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label="Copy"
      className="inline-flex text-slate-400 transition hover:text-white"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  );
}
