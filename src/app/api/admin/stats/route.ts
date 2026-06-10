import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  return withAdmin(request, async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [users, bookings, wallets, pendingPayments, paidBookings, revenue, totalViews, viewsToday] =
      await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.cryptoWallet.count(),
      prisma.booking.count({ where: { paymentStatus: { in: ["PENDING", "AWAITING_CONFIRMATION"] } } }),
      prisma.booking.count({ where: { paymentStatus: "PAID" } }),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalPrice: true },
      }),
      prisma.pageView.count(),
      prisma.pageView.count({ where: { createdAt: { gte: startOfDay } } }),
    ]);

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, offer: { select: { title: true } } },
    });

    return NextResponse.json({
      stats: {
        users,
        bookings,
        wallets,
        pendingPayments,
        paidBookings,
        totalRevenue: revenue._sum.totalPrice || 0,
        totalViews,
        viewsToday,
      },
      recentBookings,
    });
  });
}
