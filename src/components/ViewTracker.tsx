"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isAutomatedClient } from "@/lib/bot-detection";

function trackView(path: string, query: string, referrer: string | null) {
  if (path.startsWith("/admin")) return;

  const payload = JSON.stringify({
    path,
    query: query || null,
    referrer,
    source: "client",
  });

  const url = "/api/track/view";
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    return;
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
    credentials: "same-origin",
  });
}

export default function ViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const fullQuery = query ? `?${query}` : "";
  const lastTracked = useRef("");
  const tracking = useRef(false);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (typeof navigator !== "undefined" && isAutomatedClient(navigator.userAgent)) return;

    const key = `${pathname}${fullQuery}`;
    if (lastTracked.current === key && tracking.current) return;

    lastTracked.current = key;
    tracking.current = true;

    trackView(pathname, query, document.referrer || null);

    return () => {
      tracking.current = false;
    };
  }, [pathname, fullQuery]);

  return null;
}
