import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  return withAdmin(request, async () => {
    const status = new URL(request.url).searchParams.get("status") || "";

    const conversations = await prisma.chatConversation.findMany({
      where: status ? { status } : undefined,
      orderBy: { lastMessageAt: "desc" },
      take: 100,
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        guestFirstName: c.guestFirstName,
        guestLastName: c.guestLastName,
        email: c.email,
        status: c.status,
        lastMessageAt: c.lastMessageAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
        preview: c.messages[0]?.body ?? "",
        lastSender: c.messages[0]?.sender ?? null,
      })),
    });
  });
}
