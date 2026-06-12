import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return withAdmin(request, async () => {
    const { id } = await params;
    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        guestFirstName: conversation.guestFirstName,
        guestLastName: conversation.guestLastName,
        email: conversation.email,
        status: conversation.status,
        createdAt: conversation.createdAt.toISOString(),
      },
      messages: conversation.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  });
}

const patchSchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]),
});

export async function PATCH(request: Request, { params }: Params) {
  return withAdmin(request, async () => {
    try {
      const { id } = await params;
      const { status } = patchSchema.parse(await request.json());
      const conversation = await prisma.chatConversation.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ conversation: { id: conversation.id, status: conversation.status } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
      }
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  });
}

const postSchema = z.object({
  body: z.string().min(1).max(4000),
});

export async function POST(request: Request, { params }: Params) {
  return withAdmin(request, async () => {
    try {
      const { id } = await params;
      const { body } = postSchema.parse(await request.json());

      const conversation = await prisma.chatConversation.findUnique({ where: { id } });
      if (!conversation) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const message = await prisma.$transaction(async (tx) => {
        const created = await tx.chatMessage.create({
          data: {
            conversationId: id,
            sender: "ADMIN",
            body: body.trim(),
          },
        });
        await tx.chatConversation.update({
          where: { id },
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
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }
  });
}
