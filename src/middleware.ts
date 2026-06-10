import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { shouldTrackPath } from "@/lib/view-tracking";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    request.method === "GET" &&
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|coins/|.*\\..*).*)"],
};
