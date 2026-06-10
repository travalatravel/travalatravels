import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { verifyBookingAccessToken } from "@/lib/booking-access";

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
