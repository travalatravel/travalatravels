import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { verifyBookingAccessToken } from "@/lib/booking-access";
import {
  CRYPTO_PAYMENT_METHODS,
  CRYPTO_WALLET_LOOKUP,
  type CryptoPaymentMethod,
} from "@/lib/payments";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = new URL(request.url).searchParams.get("access") || "";
  const bundleId = new URL(request.url).searchParams.get("bundleId") || "";

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { offer: true, wallet: true },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const user = await getSessionFromRequest(request);
  const ownsBooking = Boolean(user && booking.userId === user.id);
  const hasAccess = access ? await verifyBookingAccessToken(access, id) : false;

  if (!ownsBooking && !hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let bundleBooking = null;
  if (bundleId) {
    const allowed =
      ownsBooking ||
      (access ? await verifyBookingAccessToken(access, bundleId) : false);
    if (allowed) {
      bundleBooking = await prisma.booking.findUnique({
        where: { id: bundleId },
        include: { offer: true, wallet: true },
      });
    }
  }

  return NextResponse.json({ booking, bundleBooking });
}

/** Switch the crypto payment method while the booking is still unpaid. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    method?: string;
    access?: string;
    bundleId?: string;
  };

  const method = body.method as CryptoPaymentMethod | undefined;
  if (!method || !CRYPTO_PAYMENT_METHODS.includes(method)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const user = await getSessionFromRequest(request);
  const ownsBooking = Boolean(user && booking.userId === user.id);
  const hasAccess = body.access ? await verifyBookingAccessToken(body.access, id) : false;
  if (!ownsBooking && !hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (booking.paymentStatus !== "PENDING") {
    return NextResponse.json(
      { error: "Payment method can no longer be changed" },
      { status: 409 },
    );
  }

  const walletMeta = CRYPTO_WALLET_LOOKUP[method];
  const wallet = await prisma.cryptoWallet.findFirst({
    where: { currency: walletMeta.currency, network: walletMeta.network, isActive: true },
  });
  if (!wallet) {
    return NextResponse.json(
      { error: `No active ${walletMeta.currency} (${walletMeta.network}) wallet configured.` },
      { status: 400 },
    );
  }

  const ids = [id];
  if (body.bundleId) {
    const bundleAllowed =
      ownsBooking ||
      (body.access ? await verifyBookingAccessToken(body.access, body.bundleId) : false);
    if (bundleAllowed) ids.push(body.bundleId);
  }

  await prisma.booking.updateMany({
    where: { id: { in: ids }, paymentStatus: "PENDING" },
    data: { paymentMethod: method, walletId: wallet.id },
  });

  const updated = await prisma.booking.findUnique({
    where: { id },
    include: { offer: true, wallet: true },
  });

  return NextResponse.json({ booking: updated });
}
