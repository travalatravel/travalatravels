import { headers } from "next/headers";
import { isAutomatedClient } from "@/lib/bot-detection";
import { recordPageView, shouldTrackPath } from "@/lib/view-tracking";

export default async function ServerPageViewTracker() {
  const hdrs = await headers();
  const path = hdrs.get("x-track-path");
  if (!path || !shouldTrackPath(path)) return null;

  const userAgent = hdrs.get("user-agent");
  if (isAutomatedClient(userAgent)) return null;

  const headerInit: Record<string, string> = {};
  hdrs.forEach((value, key) => {
    headerInit[key] = value;
  });

  const request = new Request("http://internal/track", { headers: headerInit });

  try {
    await recordPageView({
      request,
      path,
      query: hdrs.get("x-track-query") || null,
      referrer: hdrs.get("referer"),
      source: "server",
      sessionId: hdrs.get("x-visitor-id") || undefined,
    });
  } catch {
    // Never block page render because of analytics
  }

  return null;
}
