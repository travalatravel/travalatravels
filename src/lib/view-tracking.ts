import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getSessionFromRequest } from "./auth";

export const VISITOR_COOKIE = "travala_vid";
/** Covers server render + client beacon for the same page load */
const DEDUP_MS = 30_000;

const SKIP_PREFIXES = ["/api/", "/admin", "/_next/"];

export function shouldTrackPath(path: string) {
  if (!path || !path.startsWith("/")) return false;
  if (SKIP_PREFIXES.some((prefix) => path.startsWith(prefix))) return false;
  if (/\.[a-z0-9]+$/i.test(path)) return false;
  return true;
}

export function sanitizePath(path: unknown) {
  if (typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!shouldTrackPath(trimmed)) return null;
  return trimmed.slice(0, 500);
}

export function sanitizeQuery(query: unknown) {
  if (typeof query !== "string" || !query) return null;
  const normalized = query.startsWith("?") ? query.slice(1) : query;
  return normalized.slice(0, 1000) || null;
}

export function clientIp(request: Request) {
  const fromHeader =
    request.headers.get("x-track-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip");
  return fromHeader?.slice(0, 64) || null;
}

export function parseBrowser(userAgent: string | null) {
  if (!userAgent) return "Unknown";
  if (userAgent.includes("Edg/")) return "Edge";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Firefox/")) return "Firefox";
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) return "Safari";
  return "Other";
}

export function parseDevice(userAgent: string | null) {
  if (!userAgent) return "Unknown";
  if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

async function getOrCreateVisitorId(request: Request) {
  const fromMiddleware = request.headers.get("x-visitor-id");
  if (fromMiddleware) return fromMiddleware;

  const cookieHeader = request.headers.get("cookie") || "";
  const fromHeader = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${VISITOR_COOKIE}=`))
    ?.slice(VISITOR_COOKIE.length + 1);

  if (fromHeader) return decodeURIComponent(fromHeader);

  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  cookieStore.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}

export async function recordPageView(input: {
  request: Request;
  path: string;
  query?: string | null;
  referrer?: string | null;
  source: "server" | "middleware" | "client";
  sessionId?: string;
}) {
  const path = sanitizePath(input.path);
  if (!path) return { ok: false as const, reason: "skipped" };

  const query = sanitizeQuery(input.query);
  const sessionId = input.sessionId || (await getOrCreateVisitorId(input.request));
  const user = await getSessionFromRequest(input.request);
  const userAgent = requestUserAgent(input.request)?.slice(0, 512) || null;
  const ip = clientIp(input.request);

  const duplicate = await prisma.pageView.findFirst({
    where: {
      sessionId,
      path,
      query,
      createdAt: { gte: new Date(Date.now() - DEDUP_MS) },
    },
    select: { id: true },
  });

  if (duplicate) {
    return { ok: true as const, deduped: true };
  }

  await prisma.pageView.create({
    data: {
      path,
      query,
      referrer: input.referrer?.slice(0, 500) || null,
      userAgent,
      ip,
      sessionId,
      userId: user?.id || null,
      source: input.source,
    },
  });

  return { ok: true as const, deduped: false };
}

function requestUserAgent(request: Request) {
  return (
    request.headers.get("x-track-user-agent") ||
    request.headers.get("user-agent")
  );
}
