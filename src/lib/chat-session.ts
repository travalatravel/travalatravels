import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const CHAT_VISITOR_COOKIE = "travala_chat_session";

export function generateChatVisitorToken() {
  return randomBytes(24).toString("hex");
}

export async function getChatVisitorToken(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(CHAT_VISITOR_COOKIE)?.value;
  return token?.slice(0, 64) || null;
}

export function getChatVisitorTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${CHAT_VISITOR_COOKIE}=([^;]+)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).slice(0, 64);
  } catch {
    return null;
  }
}

export function attachChatVisitorCookie(response: NextResponse, token: string) {
  response.cookies.set(CHAT_VISITOR_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
