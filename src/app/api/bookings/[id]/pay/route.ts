import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const schema = z.object({
  txHash: z.string().min(10, "Transaction hash is required"),
  bundleBookingId: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionFromRequest(request);
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const { txHash, bundleBookingId } = schema.parse(body);

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking || booking.userId !== user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const idsToUpdate = [id];
    if (bundleBookingId) {
      const paired = await prisma.booking.findUnique({ where: { id: bundleBookingId } });
      if (!paired || paired.userId !== user.id) {
        return NextResponse.json({ error: "Bundle booking not found" }, { status: 404 });
      }
      idsToUpdate.push(bundleBookingId);
    }

    await prisma.booking.updateMany({
      where: { id: { in: idsToUpdate } },
      data: {
        txHash,
        paymentStatus: "AWAITING_CONFIRMATION",
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
