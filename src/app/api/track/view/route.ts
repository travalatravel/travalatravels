import { NextResponse } from "next/server";
import { recordPageView, sanitizePath } from "@/lib/view-tracking";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const path = sanitizePath(body.path);
    if (!path) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const result = await recordPageView({
      request,
      path,
      query: typeof body.query === "string" ? body.query : null,
      referrer: typeof body.referrer === "string" ? body.referrer : null,
      source: body.source === "middleware" ? "middleware" : "client",
      sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
