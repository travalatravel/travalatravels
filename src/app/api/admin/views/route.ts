import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";
import { parseBrowser, parseDevice } from "@/lib/view-tracking";

export async function GET(request: Request) {
  return withAdmin(request, async () => {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));
    const pathFilter = searchParams.get("path")?.trim() || "";
    const skip = (page - 1) * limit;

    const where = pathFilter
      ? { path: { contains: pathFilter } }
      : undefined;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [total, views, todayViews, uniqueSessionsToday, topPages] = await Promise.all([
      prisma.pageView.count({ where }),
      prisma.pageView.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.pageView.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: startOfDay } },
        distinct: ["sessionId"],
        select: { sessionId: true },
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
    ]);

    const userIds = [...new Set(views.map((v) => v.userId).filter(Boolean))] as string[];
    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
          })
        : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return NextResponse.json({
      views: views.map((view) => ({
        ...view,
        browser: parseBrowser(view.userAgent),
        device: parseDevice(view.userAgent),
        user: view.userId ? userMap.get(view.userId) || null : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        total,
        todayViews,
        uniqueSessionsToday: uniqueSessionsToday.length,
        topPages: topPages.map((row) => ({
          path: row.path,
          count: row._count.path,
        })),
      },
    });
  });
}
