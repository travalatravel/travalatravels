/**
 * BTC on-chain payment verification via mempool.space (no API key).
 *
 * Strategy: every booking gets a unique payable amount by adding a
 * deterministic 0–999 satoshi offset derived from the booking id.
 * The watcher then looks for an incoming transaction to our static
 * deposit address whose output sum matches that exact amount.
 */
import { prisma } from "@/lib/prisma";
import { getCryptoQuote, type CryptoQuote } from "@/lib/crypto-rates";

const QUOTE_LOCK_MS = 15 * 60 * 1000; // matches the 15-min payment window in the UI
const CHECK_THROTTLE_MS = 30 * 1000;
const MATCH_LOOKBACK_MS = 60 * 60 * 1000; // accept txs up to 1h before "I have paid"

export function satsOffsetForBooking(bookingId: string): number {
  let h = 0;
  for (let i = 0; i < bookingId.length; i++) {
    h = (Math.imul(31, h) + bookingId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 1000;
}

/**
 * Quote a BTC amount for a booking and lock it (in satoshis) for the
 * duration of the payment window, so the displayed amount and the
 * amount we watch for on-chain are always identical.
 */
export async function getOrLockBtcQuote(
  bookingId: string,
  usdTotal: number,
): Promise<CryptoQuote | null> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;

  const lockActive =
    booking.expectedSats != null &&
    booking.expectedQuotedAt != null &&
    (booking.paymentStatus === "AWAITING_CONFIRMATION" ||
      Date.now() - booking.expectedQuotedAt.getTime() < QUOTE_LOCK_MS);

  if (lockActive && booking.expectedSats) {
    const cryptoAmount = booking.expectedSats / 1e8;
    return {
      currency: "BTC",
      usdTotal,
      cryptoAmount,
      rate: usdTotal / cryptoAmount,
      updatedAt: (booking.expectedQuotedAt ?? new Date()).toISOString(),
    };
  }

  // Already paid (or no re-lock allowed) — never change the amount anymore.
  if (booking.paymentStatus !== "PENDING") return null;

  const fresh = await getCryptoQuote("BTC", usdTotal);
  const sats = Math.round(fresh.cryptoAmount * 1e8) + satsOffsetForBooking(bookingId);

  await prisma.booking.update({
    where: { id: bookingId },
    data: { expectedSats: sats, expectedQuotedAt: new Date() },
  });

  const cryptoAmount = sats / 1e8;
  return { ...fresh, cryptoAmount };
}

type MempoolTx = {
  txid: string;
  status: { confirmed: boolean; block_time?: number };
  vout: { scriptpubkey_address?: string; value: number }[];
};

export type BtcMatch = { txid: string; confirmed: boolean };

/** Look for an incoming tx to `address` paying exactly `expectedSats`. */
export async function findBtcPayment(
  address: string,
  expectedSats: number,
  sinceMs: number,
): Promise<BtcMatch | null> {
  const res = await fetch(
    `https://mempool.space/api/address/${encodeURIComponent(address)}/txs`,
    { signal: AbortSignal.timeout(9000), cache: "no-store" },
  );
  if (!res.ok) return null;

  const txs = (await res.json()) as MempoolTx[];
  if (!Array.isArray(txs)) return null;

  for (const tx of txs) {
    const received = tx.vout
      .filter((v) => v.scriptpubkey_address === address)
      .reduce((sum, v) => sum + v.value, 0);
    if (received !== expectedSats) continue;

    // Unconfirmed mempool txs are current by definition; for confirmed
    // ones make sure they belong to this payment window, not an old one.
    if (tx.status.confirmed) {
      const blockTimeMs = (tx.status.block_time ?? 0) * 1000;
      if (blockTimeMs && blockTimeMs < sinceMs) continue;
      return { txid: tx.txid, confirmed: true };
    }
    return { txid: tx.txid, confirmed: false };
  }

  return null;
}

/**
 * Verify a booking awaiting confirmation. Throttled to one chain lookup
 * per 30s per booking. Marks the booking (and bundle sibling) PAID when
 * a confirmed matching transaction is found.
 */
export async function verifyBtcBooking(
  bookingId: string,
  bundleBookingId?: string,
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { wallet: true },
  });
  if (
    !booking ||
    booking.paymentStatus !== "AWAITING_CONFIRMATION" ||
    booking.wallet?.currency !== "BTC" ||
    !booking.expectedSats
  ) {
    return;
  }

  const lastCheck = booking.lastChainCheckAt?.getTime() ?? 0;
  if (Date.now() - lastCheck < CHECK_THROTTLE_MS) return;

  // Claim the check slot first so parallel requests don't stampede the API.
  await prisma.booking.update({
    where: { id: bookingId },
    data: { lastChainCheckAt: new Date() },
  });

  const since =
    (booking.paidClickedAt?.getTime() ?? booking.createdAt.getTime()) - MATCH_LOOKBACK_MS;

  let match: BtcMatch | null = null;
  try {
    match = await findBtcPayment(booking.wallet.address, booking.expectedSats, since);
  } catch {
    return; // transient network error — next poll retries
  }
  if (!match) return;

  const ids = [bookingId];
  if (bundleBookingId) ids.push(bundleBookingId);

  if (match.confirmed) {
    await prisma.booking.updateMany({
      where: { id: { in: ids } },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        txHash: match.txid,
        paidAt: new Date(),
      },
    });
  } else if (booking.txHash !== match.txid) {
    await prisma.booking.updateMany({
      where: { id: { in: ids } },
      data: { txHash: match.txid },
    });
  }
}
