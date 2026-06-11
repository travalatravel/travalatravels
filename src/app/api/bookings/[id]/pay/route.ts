import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { verifyBookingAccessToken } from "@/lib/booking-access";

const schema = z.object({
  txHash: z.string().min(10).optional(),
  bundleBookingId: z.string().optional(),
  access: z.string().optional(),
});

async function canAccessBooking(
  bookingId: string,
  userId: string | null,
  access?: string,
): Promise<boolean> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return false;
  if (userId && booking.userId === userId) return true;
  if (access && (await verifyBookingAccessToken(access, bookingId))) return true;
  return false;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionFromRequest(request);
  const { id } = await params;

  try {
    const body = await request.json();
    const { txHash, bundleBookingId, access } = schema.parse(body);

    if (!(await canAccessBooking(id, user?.id ?? null, access))) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const idsToUpdate = [id];
    if (bundleBookingId) {
      if (!(await canAccessBooking(bundleBookingId, user?.id ?? null, access))) {
        return NextResponse.json({ error: "Bundle booking not found" }, { status: 404 });
      }
      idsToUpdate.push(bundleBookingId);
    }

    await prisma.booking.updateMany({
      where: { id: { in: idsToUpdate } },
      data: {
        txHash: txHash || null,
        paymentStatus: "AWAITING_CONFIRMATION",
        paidClickedAt: new Date(),
      },
    });

    const updated = await prisma.booking.findUnique({
      where: { id },
      include: { offer: true, wallet: true },
    });

    return NextResponse.json({ booking: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Payment submission failed" }, { status: 500 });
  }
}
