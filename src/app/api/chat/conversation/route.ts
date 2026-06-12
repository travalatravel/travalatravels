import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChatVisitorTokenFromRequest } from "@/lib/chat-session";

export async function GET(request: Request) {
  const token = getChatVisitorTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ conversation: null, messages: [] });
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { visitorToken: token },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
    },
  });

  if (!conversation) {
    return NextResponse.json({ conversation: null, messages: [] });
  }

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      guestFirstName: conversation.guestFirstName,
      guestLastName: conversation.guestLastName,
      email: conversation.email,
      status: conversation.status,
    },
    messages: conversation.messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
