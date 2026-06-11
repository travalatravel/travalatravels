import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAutomatedClient } from "@/lib/bot-detection";
import { shouldTrackPath, VISITOR_COOKIE } from "@/lib/view-tracking";
import { LOCALE_COOKIE } from "@/i18n/config";
import { resolveLocaleFromRequest } from "@/i18n/detect";

const PUBLIC_API_PREFIXES = [
  "/api/search",
  "/api/offers/",
  "/api/deals",
  "/api/hotel-image",
  "/api/hotel-images",
  "/api/offer-image",
  "/api/offer-images",
  "/api/offer-price",
  "/api/hotel-live-prices",
  "/api/offer-details",
  "/api/crypto/wallets",
  "/api/crypto/quote",
];

function isPublicApi(pathname: string) {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, User-Agent, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.slice(4);
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;

  if (isPublicApi(pathname)) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: corsHeaders() });
    }

    const response = NextResponse.next();
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const isTrackableHtmlVisit =
    request.method === "GET" &&
    !isAutomatedClient(request.headers.get("user-agent")) &&
    shouldTrackPath(pathname) &&
    (request.headers.get("accept") || "").includes("text/html");

  let sessionId = request.cookies.get(VISITOR_COOKIE)?.value;
  if (isTrackableHtmlVisit && !sessionId) {
    sessionId = crypto.randomUUID();
  }

  const requestHeaders = new Headers(request.headers);
  if (isTrackableHtmlVisit && sessionId) {
    requestHeaders.set("x-visitor-id", sessionId);
    requestHeaders.set("x-track-path", pathname);
    requestHeaders.set("x-track-query", request.nextUrl.search.slice(1));
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("X-Robots-Tag", "all");

  if (!request.cookies.get(LOCALE_COOKIE)) {
    const locale = resolveLocaleFromRequest(request);
    if (locale) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
  }

  if (isTrackableHtmlVisit && sessionId && !request.cookies.get(VISITOR_COOKIE)) {
    response.cookies.set(VISITOR_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|coins/|.*\\..*).*)"],
};
