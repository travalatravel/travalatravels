import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import {
  attachChatVisitorCookie,
  generateChatVisitorToken,
  getChatVisitorTokenFromRequest,
} from "@/lib/chat-session";

const schema = z.object({
  guestFirstName: z.string().min(1).max(80),
  guestLastName: z.string().min(1).max(80),
  email: z.string().email().max(200),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await getSessionFromRequest(request);
    let token = getChatVisitorTokenFromRequest(request);

    let conversation = token
      ? await prisma.chatConversation.findUnique({ where: { visitorToken: token } })
      : null;

    if (conversation) {
      conversation = await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: {
          guestFirstName: body.guestFirstName.trim(),
          guestLastName: body.guestLastName.trim(),
          email: body.email.trim().toLowerCase(),
          userId: user?.id ?? conversation.userId,
          status: "OPEN",
        },
      });
    } else {
      token = generateChatVisitorToken();
      conversation = await prisma.chatConversation.create({
        data: {
          visitorToken: token,
          guestFirstName: body.guestFirstName.trim(),
          guestLastName: body.guestLastName.trim(),
          email: body.email.trim().toLowerCase(),
          userId: user?.id ?? null,
        },
      });
    }

    const response = NextResponse.json({
      conversation: {
        id: conversation.id,
        guestFirstName: conversation.guestFirstName,
        guestLastName: conversation.guestLastName,
        email: conversation.email,
        status: conversation.status,
      },
    });

    if (token) attachChatVisitorCookie(response, token);
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
