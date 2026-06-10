"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
  });
}

export default function ViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const fullQuery = query ? `?${query}` : "";
  const isFirst = useRef(true);
  const lastTracked = useRef("");

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const key = `${pathname}${fullQuery}`;
    if (isFirst.current) {
      isFirst.current = false;
      lastTracked.current = key;
      return;
    }
    if (lastTracked.current === key) return;

    lastTracked.current = key;
    trackView(pathname, fullQuery, document.referrer || null);
  }, [pathname, fullQuery]);

  return null;
}
