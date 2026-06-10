import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAutomatedClient } from "@/lib/bot-detection";
import { shouldTrackPath } from "@/lib/view-tracking";

const PUBLIC_API_PREFIXES = [
  "/api/search",
  "/api/offers/",
  "/api/deals",
  "/api/hotel-image",
  "/api/hotel-images",
  "/api/offer-image",
  "/api/offer-images",
  "/api/offer-price",
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
  const { pathname, search } = request.nextUrl;

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

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "all");

  if (
    request.method === "GET" &&
    !isAutomatedClient(request.headers.get("user-agent")) &&
    shouldTrackPath(pathname) &&
    (request.headers.get("accept") || "").includes("text/html")
  ) {
    const trackUrl = new URL("/api/track/view", request.url);
    const body = JSON.stringify({
      path: pathname,
      query: search || null,
      referrer: request.headers.get("referer"),
      source: "middleware",
    });

    void fetch(trackUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-track-ip":
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
        "x-track-user-agent": request.headers.get("user-agent") || "",
        cookie: request.headers.get("cookie") || "",
      },
      body,
    }).catch(() => {});
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|coins/|.*\\..*).*)"],
};
