import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  return withAdmin(request, async () => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("paymentStatus");

    const bookings = await prisma.booking.findMany({
      where: status ? { paymentStatus: status } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        offer: { select: { id: true, title: true, type: true, location: true } },
        wallet: { select: { id: true, currency: true, address: true, label: true } },
      },
    });
    return NextResponse.json({ bookings });
  });
}
