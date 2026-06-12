import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getChatVisitorTokenFromRequest } from "@/lib/chat-session";

const schema = z.object({
  body: z.string().min(1).max(4000),
});

export async function POST(request: Request) {
  try {
    const token = getChatVisitorTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Please introduce yourself first" }, { status: 401 });
    }

    const conversation = await prisma.chatConversation.findUnique({
      where: { visitorToken: token },
    });
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (conversation.status === "CLOSED") {
      await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: { status: "OPEN" },
      });
    }

    const { body } = schema.parse(await request.json());
    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.chatMessage.create({
        data: {
          conversationId: conversation.id,
          sender: "VISITOR",
          body: body.trim(),
        },
      });
      await tx.chatConversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date(), status: "OPEN" },
      });
      return created;
    });

    return NextResponse.json({
      message: {
        id: message.id,
        sender: message.sender,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
