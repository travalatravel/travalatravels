"use client";

import { useEffect, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { decodeFlightToken, type FlightTokenPayload } from "@/lib/flight-token";
import { normalizeFlightPayload } from "@/lib/flight-route";
import { readOfferToken } from "@/lib/flight-selection-storage";

export function useFlightOffer(searchParams: ReadonlyURLSearchParams) {
  const tokenParam = searchParams.get("token") || "";
  const tokenRef = searchParams.get("tokenRef") === "1";
  const id = searchParams.get("id") || "";
  const [flight, setFlight] = useState<FlightTokenPayload | null>(null);
  const [token, setToken] = useState(tokenParam);
  const [loading, setLoading] = useState(Boolean(id || tokenParam || tokenRef));
  const [error, setError] = useState("");

  useEffect(() => {
    const resolvedToken = tokenParam || (tokenRef ? readOfferToken() : "");
    if (resolvedToken) {
      const decoded = decodeFlightToken(resolvedToken);
      setFlight(decoded ? normalizeFlightPayload(decoded) : null);
      setToken(tokenParam);
      setError(decoded ? "" : "Invalid flight token");
      setLoading(false);
      return;
    }

    if (id) {
      setLoading(true);
      setError("");
      const qs = searchParams.toString();
      fetch(`/api/flights/offer?${qs}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.offer && data.token) {
            setFlight(normalizeFlightPayload(data.offer));
            setToken(data.token);
          } else {
            setFlight(null);
            setError(data.error || "Offer not found");
          }
        })
        .catch(() => {
          setFlight(null);
          setError("Could not load flight offer");
        })
        .finally(() => setLoading(false));
      return;
    }

    setFlight(null);
    setLoading(false);
  }, [id, tokenParam, tokenRef, searchParams.toString()]);

  return { flight, token, loading, error };
}
